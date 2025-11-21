import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MessageTemplate, Contact } from '../../types';

import axios from 'axios';
import { Send, Users, Mail, Search, CheckCircle, AlertCircle } from 'lucide-react';

const SendMessagePage: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch templates and contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, contactsRes] = await Promise.all([
          axios.get('/templates?type=email'),
          axios.get('/contacts')
        ]);
        
        setTemplates(templatesRes.data.templates || []);
        setContacts(contactsRes.data.contacts || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter contacts by search
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      (contact.email && contact.email.toLowerCase().includes(searchLower)) ||
      (contact.city && contact.city.toLowerCase().includes(searchLower)) ||
      (contact.state && contact.state.toLowerCase().includes(searchLower))
    );
  });

  // Toggle contact selection
  const toggleContact = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Select all filtered contacts
  const selectAll = () => {
    setSelectedContacts(filteredContacts.map(c => c.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedContacts([]);
  };

  // Send messages
  const handleSend = async () => {
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    if (selectedContacts.length === 0) {
      setError('Please select at least one recipient');
      return;
    }

    setSending(true);
    setError('');
    setSuccess(false);

    try {
      // Send directly without creating a campaign
      await axios.post('/messages/send-bulk', {
        templateId: parseInt(selectedTemplate),
        contactIds: selectedContacts
      });

      setSuccess(true);
      setSelectedTemplate('');
      setSelectedContacts([]);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error sending messages:', error);
      setError(error.response?.data?.error || 'Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Send Message</h1>
          <p className="text-gray-600 mt-1">Send emails to your contacts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Messages sent successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Select Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">1</span>
            <span>Select Email Template</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-gray-600">No templates available. Create one first!</p>
          ) : (
            <div className="grid gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id.toString())}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTemplate === template.id.toString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1"><strong>Subject:</strong> {template.subject}</p>
                      {template.category && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {template.category}
                        </span>
                      )}
                    </div>
                    {selectedTemplate === template.id.toString() && (
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Select Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">2</span>
              <span>Select Recipients</span>
            </div>
            <div className="flex items-center space-x-2 text-sm font-normal">
              <Users className="h-4 w-4" />
              <span>{selectedContacts.length} selected</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and bulk actions */}
          <div className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={selectAll} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={clearSelection} variant="outline" size="sm">
              Clear
            </Button>
          </div>

          {/* Contacts list */}
          {filteredContacts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No contacts found</p>
          ) : (
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedContacts.includes(contact.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      {contact.city && contact.state && (
                        <p className="text-xs text-gray-500 mt-1">
                          {contact.city}, {contact.state}
                        </p>
                      )}
                    </div>
                    {selectedContacts.includes(contact.id) && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Send */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">
                Ready to send <strong>{selectedContacts.length} email{selectedContacts.length !== 1 ? 's' : ''}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Messages will be sent immediately and appear in Message History
              </p>
            </div>
            <Button
              onClick={handleSend}
              disabled={sending || !selectedTemplate || selectedContacts.length === 0}
              size="lg"
              className="flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>{sending ? 'Sending...' : 'Send Now'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendMessagePage;

