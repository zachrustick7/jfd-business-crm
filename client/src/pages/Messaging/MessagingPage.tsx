import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MessageCampaign, MessageTemplate, Contact, CreateCampaignRequest } from '../../types';

import axios from 'axios';
import { Plus, Search, Send, Users, Mail, MessageSquare, Calendar, Eye, Edit2, Trash2, Play, Pause, CheckCircle, XCircle, Clock } from 'lucide-react';

const MessagingPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<MessageCampaign[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sending' | 'completed' | 'failed'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    selectedContacts: [] as number[],
    type: 'email' as 'email' | 'sms',
    scheduledAt: ''
  });
  const [sendingCampaignId, setSendingCampaignId] = useState<number | null>(null);

  // Fetch data
  const fetchCampaigns = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`/campaigns?${params.toString()}`);
      const campaignsData = response.data.campaigns || [];
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/templates');
      const templatesData = response.data.templates || [];
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/contacts');
      const contactsData = response.data.contacts || [];
      setContacts(Array.isArray(contactsData) ? contactsData : []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
    fetchContacts();
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, searchTerm]);

  // Filter campaigns
  const filteredCampaigns = Array.isArray(campaigns) ? campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  // Handle sending a campaign
  const handleSendCampaign = async (campaignId: number) => {
    setSendingCampaignId(campaignId);
    
    try {
      const response = await axios.post(`/campaigns/${campaignId}/send`);
      
      // Refresh campaigns list to show updated status
      fetchCampaigns();
      
      console.log('Campaign sent successfully:', response.data);
      // You could add a toast notification here
      
    } catch (error) {
      console.error('Error sending campaign:', error);
      // You could add error toast notification here
    } finally {
      setSendingCampaignId(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const campaignData: CreateCampaignRequest = {
        name: formData.name,
        templateId: parseInt(formData.templateId),
        contactIds: formData.selectedContacts,
        type: formData.type,
        scheduledAt: formData.scheduledAt || undefined
      };

      await axios.post('/campaigns', campaignData);
      await fetchCampaigns();
      handleCloseForm();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle contact selection
  const handleContactToggle = (contactId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedContacts: prev.selectedContacts.includes(contactId)
        ? prev.selectedContacts.filter(id => id !== contactId)
        : [...prev.selectedContacts, contactId]
    }));
  };

  const handleSelectAllContacts = () => {
    const eligibleContacts = contacts.filter(contact => 
      formData.type === 'email' ? contact.email : contact.phone
    );
    
    setFormData(prev => ({
      ...prev,
      selectedContacts: prev.selectedContacts.length === eligibleContacts.length 
        ? [] 
        : eligibleContacts.map(c => c.id)
    }));
  };

  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        type: template.type
      }));
    }
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowCreateForm(false);
    setFormData({
      name: '',
      templateId: '',
      selectedContacts: [],
      type: 'email',
      scheduledAt: ''
    });
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft':
        return { icon: <Edit2 className="h-4 w-4" />, color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'sending':
        return { icon: <Play className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'completed':
        return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600', bg: 'bg-green-100' };
      case 'failed':
        return { icon: <XCircle className="h-4 w-4" />, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: <Clock className="h-4 w-4" />, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  // Get eligible contacts for selected template type
  const eligibleContacts = contacts.filter(contact => 
    formData.type === 'email' ? contact.email : contact.phone
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading messaging data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Campaigns</h1>
          <p className="text-gray-600 mt-1">Create and manage bulk messaging campaigns</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Campaigns</p>
                <p className="text-lg font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-lg font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Draft</p>
                <p className="text-lg font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Recipients</p>
                <p className="text-lg font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.totalRecipients, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('draft')}
                size="sm"
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                size="sm"
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">
              {campaigns.length === 0 
                ? "Get started by creating your first message campaign."
                : "Try adjusting your search or filters."
              }
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => {
            const statusDisplay = getStatusDisplay(campaign.status);
            return (
              <Card key={campaign.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {campaign.type === 'email' ? (
                            <Mail className="h-6 w-6 text-blue-600" />
                          ) : (
                            <MessageSquare className="h-6 w-6 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                            <span className={`status-pill ${statusDisplay.bg} ${statusDisplay.color}`}>
                              <span className="icon">{statusDisplay.icon}</span>
                              <span className="capitalize">{campaign.status}</span>
                            </span>
                            <span className={`status-pill ${
                              campaign.type === 'email' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {campaign.type.toUpperCase()}
                            </span>
                          </div>
                          
                          {campaign.templateName && (
                            <p className="text-sm text-gray-600 mb-2">
                              Template: {campaign.templateName}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{campaign.totalRecipients} recipients</span>
                            </div>
                            {campaign.sentCount > 0 && (
                              <div className="flex items-center space-x-1">
                                <Send className="h-4 w-4" />
                                <span>{campaign.sentCount} sent</span>
                              </div>
                            )}
                            {campaign.deliveredCount > 0 && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>{campaign.deliveredCount} delivered</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            Created {new Date(campaign.createdAt).toLocaleDateString()}
                            {campaign.sentAt && (
                              <span> • Sent {new Date(campaign.sentAt).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2"
                        title="View campaign details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {campaign.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-green-600 hover:bg-green-50 p-2"
                          title="Send campaign"
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={sendingCampaignId === campaign.id}
                        >
                          {sendingCampaignId === campaign.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2"
                        title="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 24px 8px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
            </div>
            
            <div style={{ padding: '8px 24px 16px 24px' }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campaign Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Monthly Newsletter"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template *
                    </label>
                    <select
                      required
                      value={formData.templateId}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="form-select w-full"
                    >
                      <option value="">Select a template</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contact Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Recipients * ({formData.selectedContacts.length} selected)
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllContacts}
                    >
                      {formData.selectedContacts.length === eligibleContacts.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  
                  <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                    {eligibleContacts.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No contacts available for {formData.type} messages
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {eligibleContacts.map(contact => (
                          <label key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.selectedContacts.includes(contact.id)}
                              onChange={() => handleContactToggle(contact.id)}
                              className="rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {contact.firstName} {contact.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formData.type === 'email' ? contact.email : contact.phone}
                                {contact.company && ` • ${contact.company}`}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={formLoading || formData.selectedContacts.length === 0}
                  >
                    {formLoading ? 'Creating...' : 'Create Campaign'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage; 