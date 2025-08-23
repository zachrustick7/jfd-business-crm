import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MessageTemplate, TemplateFormData, TemplatePreview } from '../../types';

import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Eye, Mail, MessageSquare, FileText, Tag } from 'lucide-react';

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'email' | 'sms'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    subject: '',
    body: '',
    type: 'email',
    category: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<TemplatePreview | null>(null);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`/templates?${params.toString()}`);
      const templatesData = response.data.templates || [];
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [typeFilter, searchTerm]);

  // Filter templates based on search and type
  const filteredTemplates = Array.isArray(templates) ? templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.subject && template.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         template.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.category && template.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    
    return matchesSearch && matchesType;
  }) : [];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const templateData = {
        name: formData.name,
        subject: formData.type === 'email' ? formData.subject : undefined,
        body: formData.body,
        type: formData.type,
        category: formData.category || undefined
      };

      if (editingTemplate) {
        await axios.put(`/templates/${editingTemplate.id}`, templateData);
      } else {
        await axios.post('/templates', templateData);
      }
      
      await fetchTemplates();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete template
  const handleDelete = async (templateId: number) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await axios.delete(`/templates/${templateId}`);
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template. Please try again.');
    }
  };

  // Handle edit template
  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject || '',
      body: template.body,
      type: template.type,
      category: template.category || ''
    });
    setShowAddForm(true);
  };

  // Handle preview template
  const handlePreview = async (template: MessageTemplate) => {
    try {
      const response = await axios.post(`/templates/${template.id}/preview`);
      setPreviewData(response.data.preview);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing template:', error);
      alert('Error previewing template. Please try again.');
    }
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      type: 'email',
      category: ''
    });
  };

  // Handle close preview
  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  // Get template stats
  const stats = {
    total: templates.length,
    email: templates.filter(t => t.type === 'email').length,
    sms: templates.filter(t => t.type === 'sms').length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable message templates</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">SMS Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sms}</p>
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
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={typeFilter === 'email' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('email')}
                size="sm"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
              <Button
                variant={typeFilter === 'sms' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('sms')}
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                SMS
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {templates.length === 0 
                ? "Get started by creating your first message template."
                : "Try adjusting your search or filters."
              }
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {template.type === 'email' ? (
                          <Mail className="h-6 w-6 text-blue-600" />
                        ) : (
                          <MessageSquare className="h-6 w-6 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          <span className={`status-pill ${
                            template.type === 'email' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {template.type.toUpperCase()}
                          </span>
                          {template.category && (
                            <span className="status-pill bg-gray-100 text-gray-600">
                              <Tag className="h-3 w-3 icon" />
                              {template.category}
                            </span>
                          )}
                        </div>
                        
                        {template.subject && (
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Subject: {template.subject}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {template.body.length > 150 
                            ? `${template.body.substring(0, 150)}...` 
                            : template.body
                          }
                        </p>
                        
                        {template.variables.length > 0 && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-gray-500">Variables:</span>
                            <div className="flex flex-wrap gap-1">
                              {template.variables.map((variable) => (
                                <span key={variable} className="status-pill-sm bg-yellow-100 text-yellow-800">
                                  {`{{${variable}}}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(template)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2"
                      title="Preview template"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2"
                      title="Edit template"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2"
                      title="Delete template"
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

      {/* Add/Edit Template Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 24px 8px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
            </div>
            
            <div style={{ padding: '8px 24px 16px 24px' }}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Welcome Email"
                      style={{ height: '36px', fontSize: '14px' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'email' | 'sms'})}
                      className="form-select w-full"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {formData.type === 'email' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Subject Line
                      </label>
                      <Input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="e.g., Welcome to our service!"
                        style={{ height: '36px', fontSize: '14px' }}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <Input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g., Welcome, Follow-up"
                      style={{ height: '36px', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Message Body *
                  </label>
                  <textarea
                    required
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    placeholder="Hi {{firstName}}, welcome to our service! We're excited to have you at {{company}}..."
                    rows={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    style={{ fontSize: '14px', resize: 'none' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {`{{variableName}}`} for dynamic content. Available: firstName, lastName, email, phone, company, position
                  </p>
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
                    disabled={formLoading}
                  >
                    {formLoading ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 24px 8px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 className="text-xl font-semibold text-gray-900">Template Preview</h2>
            </div>
            
            <div style={{ padding: '16px 24px' }}>
              {previewData.subject && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">{previewData.subject}</p>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                <div className="p-4 bg-gray-50 rounded-md border">
                  <p className="text-sm whitespace-pre-wrap">{previewData.body}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Data Used:</label>
                <div className="p-3 bg-blue-50 rounded-md border text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Name: {previewData.sampleData.firstName} {previewData.sampleData.lastName}</div>
                    <div>Email: {previewData.sampleData.email}</div>
                    <div>Phone: {previewData.sampleData.phone}</div>
                    <div>Company: {previewData.sampleData.company}</div>
                    <div>Position: {previewData.sampleData.position}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleClosePreview}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage; 