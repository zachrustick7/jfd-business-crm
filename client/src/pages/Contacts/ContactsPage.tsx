import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Contact } from '../../types';
import { US_STATES, FILING_STATUSES, CONTACT_STATUSES } from '../../lib/constants';

import axios from 'axios';
import { Plus, Search, Upload, Edit2, Trash2, Mail, Phone, Building2, User, MapPin, Tag as TagIcon } from 'lucide-react';

interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  filing_status: string;
  status: string;
  tags: string;
  notes: string;
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    filing_status: '',
    status: 'active',
    tags: '',
    notes: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const response = await axios.get('/contacts');
      // Backend returns { contacts: [...], pagination: {...} }
      const contactsData = response.data.contacts || [];
      setContacts(Array.isArray(contactsData) ? contactsData : []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Filter contacts based on search (ensure contacts is always an array)
  const filteredContacts = Array.isArray(contacts) ? contacts.filter(contact =>
    `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.company || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) : [];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Convert form data to the format expected by the backend (camelCase)
      const contactData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zip_code,
        filingStatus: formData.filing_status,
        status: formData.status || 'active',
        notes: formData.notes,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      if (editingContact) {
        // Update existing contact
        await axios.put(`/contacts/${editingContact.id}`, contactData);
      } else {
        // Create new contact
        await axios.post('/contacts', contactData);
      }
      
      await fetchContacts();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete contact
  const handleDelete = async (contactId: number) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await axios.delete(`/contacts/${contactId}`);
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error deleting contact. Please try again.');
    }
  };

  // Handle edit contact
  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      position: contact.position || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      zip_code: contact.zipCode || '',
      filing_status: contact.filingStatus || '',
      status: contact.status || 'active',
      tags: Array.isArray(contact.tags) ? contact.tags.join(', ') : '',
      notes: contact.notes || ''
    });
    setShowAddForm(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingContact(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      filing_status: '',
      status: 'active',
      tags: '',
      notes: ''
    });
  };

  // Handle CSV upload
  const handleCsvUpload = async () => {
    if (!csvFile) return;

    setUploadingCsv(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await axios.post('/contacts/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert(`Successfully imported ${response.data.imported} contacts!`);
      await fetchContacts();
      setCsvFile(null);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Error uploading CSV. Please check the format and try again.');
    } finally {
      setUploadingCsv(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-500 mt-1">
              {Array.isArray(contacts) ? contacts.length : 0} total contacts
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Contact</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 space-y-6">

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* CSV Import Section - Only show when needed */}
      {csvFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Upload className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">{csvFile.name}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleCsvUpload}
              disabled={uploadingCsv}
              size="sm"
            >
              {uploadingCsv ? 'Importing...' : 'Import'}
            </Button>
            <Button
              onClick={() => setCsvFile(null)}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Import Button - Clean and minimal */}
      {!csvFile && (
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="hidden"
            id="csv-upload"
          />
          <label 
            htmlFor="csv-upload" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Import from CSV</span>
          </label>
        </div>
      )}

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-16">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first contact'}
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {contact.firstName} {contact.lastName}
                        </h3>
                        
                        <div className="space-y-2">
                          {contact.email && (
                            <div className="flex items-center space-x-3 text-gray-600">
                              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm">{contact.email}</span>
                            </div>
                          )}
                          
                          {contact.phone && (
                            <div className="flex items-center space-x-3 text-gray-600">
                              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm">{contact.phone}</span>
                            </div>
                          )}
                          
                          {contact.company && (
                            <div className="flex items-center space-x-3 text-gray-600">
                              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm">
                                {contact.company}
                                {contact.position && (
                                  <span className="text-gray-500"> • {contact.position}</span>
                                )}
                              </span>
                            </div>
                          )}
                          
                          {contact.position && !contact.company && (
                            <div className="flex items-center space-x-3 text-gray-600">
                              <div className="h-4 w-4 flex-shrink-0"></div>
                              <span className="text-sm text-gray-500">{contact.position}</span>
                            </div>
                          )}
                          
                          {(contact.city || contact.state) && (
                            <div className="flex items-center space-x-3 text-gray-600">
                              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm">
                                {contact.city}{contact.city && contact.state && ', '}{contact.state}
                              </span>
                            </div>
                          )}
                          
                          {contact.filingStatus && (
                            <div className="flex items-center space-x-3">
                              <span className="status-pill-sm bg-purple-100 text-purple-700">
                                {contact.filingStatus}
                              </span>
                            </div>
                          )}
                          
                          {contact.tags && contact.tags.length > 0 && (
                            <div className="flex items-start space-x-2 mt-2">
                              <TagIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <div className="flex flex-wrap gap-1">
                                {contact.tags.map((tag, idx) => (
                                  <span key={idx} className="status-pill-sm bg-blue-50 text-blue-700">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2"
                      title="Edit contact"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2"
                      title="Delete contact"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Contact Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <Card className="w-full max-w-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <CardHeader style={{ padding: '16px 24px 8px 24px' }}>
              <CardTitle style={{ fontSize: '18px', margin: 0 }}>
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '8px 24px 16px 24px' }}>
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '12px' }}>
                  <div>
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      First Name *
                    </label>
                    <Input
                      required
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      Last Name *
                    </label>
                    <Input
                      required
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      Email *
                    </label>
                    <Input
                      type="email"
                      required
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      Phone
                    </label>
                    <Input
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '12px' }}>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      Street Address
                    </label>
                    <Input
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      City
                    </label>
                    <Input
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                        State
                      </label>
                      <select
                        className="form-select w-full"
                        style={{ height: '36px', fontSize: '14px' }}
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                      >
                        <option value="">Select...</option>
                        {US_STATES.map(state => (
                          <option key={state.code} value={state.code}>{state.code}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                        ZIP Code
                      </label>
                      <Input
                        style={{ height: '36px', fontSize: '14px' }}
                        value={formData.zip_code}
                        onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '12px' }}>
                  <div>
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      Company
                    </label>
                    <Input
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      Position
                    </label>
                    <Input
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                    />
                  </div>
                </div>

                {/* Tax & Status Information */}
                <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '12px' }}>
                  <div>
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      Filing Status
                    </label>
                    <select
                      className="form-select w-full"
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.filing_status}
                      onChange={(e) => setFormData({...formData, filing_status: e.target.value})}
                    >
                      <option value="">Select...</option>
                      {FILING_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                      Contact Status
                    </label>
                    <select
                      className="form-select w-full"
                      style={{ height: '36px', fontSize: '14px' }}
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      {CONTACT_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ marginBottom: '12px' }}>
                  <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                    Tags (comma-separated)
                  </label>
                  <Input
                    style={{ height: '36px', fontSize: '14px' }}
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="VIP, Customer, Lead"
                  />
                </div>
                
                {/* Notes */}
                <div style={{ marginBottom: '12px' }}>
                  <label className="block text-xs font-medium text-gray-700" style={{ marginBottom: '4px' }}>
                    Notes
                  </label>
                  <textarea
                    className="form-input"
                    rows={2}
                    style={{ fontSize: '14px', resize: 'none' }}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes..."
                  />
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-3 pt-2 border-t">
                  <Button type="submit" disabled={formLoading} className="flex-1" style={{ height: '36px', fontSize: '14px' }}>
                    {formLoading ? 'Saving...' : (editingContact ? 'Update' : 'Add Contact')}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCloseForm} style={{ height: '36px', fontSize: '14px' }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
};

export default ContactsPage; 