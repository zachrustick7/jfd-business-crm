import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  Mail, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Target,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalContacts: number;
  messagesSent: number;
  templatesCreated: number;
  activeCampaigns: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  deliveryRate: number;
  contactsGrowth: number;
  messagesGrowth: number;
  templatesGrowth: number;
  campaignsGrowth: number;
  openRateGrowth: number;
  clickRateGrowth: number;
  responseRateGrowth: number;
  deliveryRateGrowth: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 247,
    messagesSent: 1429,
    templatesCreated: 18,
    activeCampaigns: 3,
    openRate: 68.5,
    clickRate: 24.3,
    responseRate: 15.7,
    deliveryRate: 96.2,
    contactsGrowth: 12,
    messagesGrowth: 8,
    templatesGrowth: 2,
    campaignsGrowth: 0,
    openRateGrowth: 5.2,
    clickRateGrowth: 2.1,
    responseRateGrowth: -1.3,
    deliveryRateGrowth: 0.8
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading real data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    
    return (
      <div className={`status-pill ${colorClass}`}>
        <Icon className="h-3 w-3 icon" />
        {isPositive ? '+' : ''}{growth}%
      </div>
    );
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your clients.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-gray-900">{getCurrentDate()}</p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg border border-blue-200">
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#1f2937' }}>Good morning, John! 👋</h2>
        <p style={{ color: '#374151', fontSize: '18px', fontWeight: '600' }}>Here's what's happening with your client communications today.</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              {formatGrowth(stats.contactsGrowth)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalContacts.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              {formatGrowth(stats.messagesGrowth)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Messages Sent</p>
              <p className="text-3xl font-bold text-gray-900">{stats.messagesSent.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              {formatGrowth(stats.templatesGrowth)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Templates Created</p>
              <p className="text-3xl font-bold text-gray-900">{stats.templatesCreated}</p>
              <p className="text-xs text-gray-500 mt-1">from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="status-pill text-blue-600 bg-blue-50">
                stable
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              <p className="text-xs text-gray-500 mt-1">from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              {formatGrowth(stats.openRateGrowth)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Open Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.openRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Average email open rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              {formatGrowth(stats.clickRateGrowth)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Click Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.clickRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Average click-through rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              {formatGrowth(stats.responseRateGrowth)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.responseRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Client response rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              {formatGrowth(stats.deliveryRateGrowth)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Delivery Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.deliveryRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Message delivery success</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Message Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Recent Message Performance</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Performance metrics for your latest campaigns</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Tax Season Reminder</p>
                  <p className="text-sm text-gray-600">Sent 2 days ago • 156 recipients</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">72%</p>
                  <p className="text-xs text-gray-500">Open rate</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Quarterly Update</p>
                  <p className="text-sm text-gray-600">Sent 1 week ago • 203 recipients</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">65%</p>
                  <p className="text-xs text-gray-500">Open rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Jump to common tasks</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-auto p-4 flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Add Contact</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Mail className="h-6 w-6" />
                <span>Send Message</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <FileText className="h-6 w-6" />
                <span>New Template</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage; 