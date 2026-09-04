import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { useRef } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import {
  Bell,
  Send,
  ScanLine,
  QrCode,
  CreditCard,
  History,
  Home,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Shield,
  Settings,
  HelpCircle,
  Info,
  Share2,
  Download,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Tag,
  CheckCircle2,
  FileText,
  Search,
  Check,
  X,
  Phone,
  Mail,
  Copy,
  Camera,
} from 'lucide-react-native';
import apiClient, { setAuthToken } from '../api/client';
import dayjs from 'dayjs';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<any>(null);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [availableBanks, setAvailableBanks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Active Navigation & Modal States
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'offers' | 'profile'>('home');
  const [activeModal, setActiveModal] = useState<
    'none' | 'bankAccounts' | 'myQr' | 'miniStatement' | 'pinVerify' | 'notifications' | 'addAccount' | 'scanQr' | 'security' | 'settings' | 'support' | 'about' | 'txnDetail' | 'vault'
  >('none');

  // Interactive Feature States
  const [showBalance, setShowBalance] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);
  
  // History Search & Filter State
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'debit' | 'credit'>('all');

  const qrRef = useRef<View>(null);

  const handleCopyUPI = async () => {
    if (upiId) {
      await Clipboard.setStringAsync(upiId);
      Alert.alert('Copied!', 'UPI ID copied to clipboard');
    }
  };

  const handleDownloadQR = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Storage permission is required to save the QR code.');
        return;
      }

      if (qrRef.current) {
        const uri = await captureRef(qrRef, {
          format: 'png',
          quality: 1,
        });
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Saved!', 'QR Code downloaded to device gallery successfully.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save QR Code.');
    }
  };

  const handleShareQR = async () => {
    try {
      if (qrRef.current) {
        const uri = await captureRef(qrRef, {
          format: 'png',
          quality: 1,
        });
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            dialogTitle: 'Share my DEV PAY QR Code',
            mimeType: 'image/png',
          });
        } else {
          Alert.alert('Error', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to share QR Code.');
    }
  };

  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  // Add Account Flow State
  const [searchBankQuery, setSearchBankQuery] = useState('');
  const [selectedBankForAdd, setSelectedBankForAdd] = useState<any>(null);
  const [newAccNumber, setNewAccNumber] = useState('');
  const [linkingAccount, setLinkingAccount] = useState(false);

  // Change PIN State
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  const fetchData = async () => {
    try {
      const [profileRes, txRes, contactsRes, notifRes, accRes] = await Promise.all([
        apiClient.get('/user/profile'),
        apiClient.get('/transactions/history?limit=20'),
        apiClient.get('/user/recent-contacts'),
        apiClient.get('/user/notifications'),
        apiClient.get('/user/accounts'),
      ]);

      setProfile(profileRes.data.data.user);
      setBankAccount(profileRes.data.data.bankAccount);
      setTransactions(txRes.data.data.transactions || []);
      setRecentContacts(contactsRes.data.data.contacts || []);
      setNotifications(notifRes.data.data.notifications || []);
      setAllAccounts(accRes.data.data.accounts || (profileRes.data.data.bankAccount ? [profileRes.data.data.bankAccount] : []));
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of DEV PAY?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          setAuthToken('');
          navigation.replace('Login');
        },
      },
    ]);
  };

  // Real Backend PIN Verification
  const handleVerifyPinForBalance = async () => {
    if (enteredPin.length !== 4) {
      setPinError('Please enter a 4-digit PIN');
      return;
    }

    setVerifyingPin(true);
    setPinError('');
    try {
      await apiClient.post('/pin/verify', { pin: enteredPin });
      setShowBalance(true);
      setActiveModal('none');
      setEnteredPin('');
    } catch (err: any) {
      setPinError(err.message || 'Invalid PIN');
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleToggleBalance = () => {
    if (showBalance) {
      setShowBalance(false);
    } else {
      setEnteredPin('');
      setPinError('');
      setActiveModal('pinVerify');
    }
  };

  // Open Add Account Modal and fetch bank list
  const handleOpenAddAccount = async () => {
    try {
      const res = await apiClient.get('/banks');
      setAvailableBanks(res.data.data.banks || []);
      setSelectedBankForAdd(null);
      setNewAccNumber('');
      setActiveModal('addAccount');
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch bank list');
    }
  };

  // Submit Add Account
  const handleConfirmAddAccount = async () => {
    if (!selectedBankForAdd) {
      Alert.alert('Select Bank', 'Please select a bank to continue');
      return;
    }
    if (!newAccNumber || newAccNumber.length < 8) {
      Alert.alert('Invalid Account', 'Please enter a valid account number');
      return;
    }

    setLinkingAccount(true);
    try {
      await apiClient.post('/user/accounts/add', {
        bankId: selectedBankForAdd._id,
        accountNumber: newAccNumber,
      });
      await fetchData();
      setActiveModal('none');
      Alert.alert('Success', `${selectedBankForAdd.name} account linked successfully!`);
    } catch (err: any) {
      Alert.alert('Linking Failed', err.message || 'Could not link bank account');
    } finally {
      setLinkingAccount(false);
    }
  };

  // Handle Scan QR simulation
  const handleSimulateScan = (scannedUpi: string) => {
    setActiveModal('none');
    navigation.navigate('SendMoney');
  };

  // Change PIN handler
  const handleChangePin = async () => {
    if (newPinInput.length !== 4 || confirmPinInput.length !== 4) {
      Alert.alert('Error', 'PIN must be exactly 4 digits');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    try {
      await apiClient.post('/pin/set', { pin: newPinInput, confirmPin: confirmPinInput });
      Alert.alert('Success', 'Transaction PIN updated successfully');
      setNewPinInput('');
      setConfirmPinInput('');
      setActiveModal('none');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update PIN');
    }
  };

  const balance = bankAccount
    ? `₹ ${bankAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹ 0.00';
  const firstName = profile?.firstName || 'User';
  const lastName = profile?.lastName || '';
  const bankName = bankAccount?.bankId?.name || 'State Bank of India';
  const last4 = bankAccount?.cardNumberLast4 || '2356';
  const upiId = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@devpay`;

  // History Filtering
  const filteredTransactions = transactions.filter((txn) => {
    const isDebit = txn.type === 'transfer' || txn.type === 'payment';
    const matchesSearch =
      txn.title.toLowerCase().includes(historySearch.toLowerCase()) ||
      (txn.referenceId && txn.referenceId.toLowerCase().includes(historySearch.toLowerCase()));

    if (historyFilter === 'debit') return matchesSearch && isDebit;
    if (historyFilter === 'credit') return matchesSearch && !isDebit;
    return matchesSearch;
  });

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      {/* Main Container */}
      <View className="flex-1">
        {/* --- HOME TAB --- */}
        {activeTab === 'home' && (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
          >
            {/* Top Header */}
            <View className="bg-indigo-600 px-6 pt-6 pb-16 rounded-b-3xl">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-indigo-200 text-xs font-medium">Good Evening,</Text>
                  <Text className="text-white text-2xl font-bold mt-0.5">
                    {firstName} 👋
                  </Text>
                  <Text className="text-indigo-200 text-[11px] mt-0.5">Welcome back to DEV PAY</Text>
                </View>

                <View className="flex-row items-center space-x-3">
                  <TouchableOpacity
                    onPress={() => setActiveModal('notifications')}
                    className="w-10 h-10 bg-indigo-500/50 rounded-full items-center justify-center relative"
                  >
                    <Bell size={20} color="#FFFFFF" />
                    {unreadNotifsCount > 0 && (
                      <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-indigo-600" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActiveTab('profile')}
                    className="w-10 h-10 bg-indigo-200 rounded-full items-center justify-center border-2 border-indigo-300"
                  >
                    <Text className="text-indigo-900 font-bold text-base">{firstName.charAt(0)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Overlapping Primary Bank Card */}
            <View className="px-6 -mt-10">
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => setActiveModal('miniStatement')}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-100"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center">
                      <Text className="text-white font-bold text-xs">{bankAccount?.bankId?.abbreviation || 'SBI'}</Text>
                    </View>
                    <View>
                      <Text className="text-gray-900 font-bold text-base">{bankName}</Text>
                      <Text className="text-gray-400 text-xs">•••• {last4}</Text>
                    </View>
                  </View>
                  <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Text className="text-emerald-700 text-xs font-semibold">Primary</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                  <Text className="text-gray-500 text-xs font-medium">Tap to view balance</Text>
                  <TouchableOpacity onPress={handleToggleBalance} className="p-1 flex-row items-center space-x-1">
                    <Text className="text-indigo-600 font-semibold text-xs mr-1">
                      {showBalance ? balance : '••••••••'}
                    </Text>
                    {showBalance ? <EyeOff size={18} color="#4F46E5" /> : <Eye size={18} color="#4F46E5" />}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>

            {/* Quick Actions Grid */}
            <View className="px-6 mt-6">
              <Text className="text-gray-900 font-bold text-base mb-3">Quick Actions</Text>
              <View className="flex-row flex-wrap justify-between">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('SendMoney')}
                  className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3 flex-row items-center space-x-3"
                >
                  <View className="w-11 h-11 bg-indigo-600 rounded-xl items-center justify-center">
                    <Send size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-sm">Pay Now</Text>
                    <Text className="text-gray-400 text-[10px] mt-0.5" numberOfLines={1}>Send money instantly</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveModal('myQr')}
                  className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3 flex-row items-center space-x-3"
                >
                  <View className="w-11 h-11 bg-indigo-600 rounded-xl items-center justify-center">
                    <QrCode size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-sm">My QR</Text>
                    <Text className="text-gray-400 text-[10px] mt-0.5" numberOfLines={1}>View, Share & Download</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveModal('bankAccounts')}
                  className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3 flex-row items-center space-x-3"
                >
                  <View className="w-11 h-11 bg-indigo-600 rounded-xl items-center justify-center">
                    <CreditCard size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-sm">Bank Accounts</Text>
                    <Text className="text-gray-400 text-[10px] mt-0.5" numberOfLines={1}>Manage linked accounts</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveModal('vault')}
                  className="w-[48%] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3 flex-row items-center space-x-3"
                >
                  <View className="w-11 h-11 bg-indigo-600 rounded-xl items-center justify-center">
                    <Lock size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-sm">Vault</Text>
                    <Text className="text-gray-400 text-[10px] mt-0.5" numberOfLines={1}>Secure your savings</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dynamic Recent Contacts */}
            <View className="px-6 mt-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-900 font-bold text-base">Recent Contacts</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SendMoney')}>
                  <ChevronRight size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-4 py-1">
                {recentContacts.map((contact, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => navigation.navigate('SendMoney')}
                    className="items-center space-y-1 mr-4"
                  >
                    <View className="w-14 h-14 bg-indigo-100 rounded-full items-center justify-center border-2 border-indigo-200">
                      <Text className="text-indigo-700 font-bold text-lg">{contact.initial}</Text>
                    </View>
                    <Text className="text-gray-700 text-xs font-medium">{contact.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recent Transactions */}
            <View className="px-6 mt-6 pb-28">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-900 font-bold text-base">Recent Transactions</Text>
                <TouchableOpacity onPress={() => setActiveTab('history')}>
                  <Text className="text-indigo-600 font-semibold text-xs">See All</Text>
                </TouchableOpacity>
              </View>

              {transactions.length === 0 ? (
                <View className="bg-white p-6 rounded-2xl items-center justify-center border border-gray-100">
                  <Text className="text-gray-400 text-sm">No recent transactions</Text>
                </View>
              ) : (
                transactions.slice(0, 5).map((txn, index) => {
                  const isDebit = txn.type === 'transfer' || txn.type === 'payment';
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedTxn(txn);
                        setActiveModal('txnDetail');
                      }}
                      className="bg-white p-4 rounded-2xl border border-gray-100 mb-2.5 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center space-x-3">
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${isDebit ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          {isDebit ? <ArrowUpRight size={18} color="#EF4444" /> : <ArrowDownLeft size={18} color="#10B981" />}
                        </View>
                        <View>
                          <Text className="text-gray-900 font-bold text-sm">{txn.title}</Text>
                          <Text className="text-gray-400 text-xs mt-0.5">
                            {dayjs(txn.createdAt).format('DD MMM, hh:mm A')}
                          </Text>
                        </View>
                      </View>
                      <Text className={`font-bold text-sm ${isDebit ? 'text-gray-900' : 'text-emerald-600'}`}>
                        {isDebit ? '-' : '+'}₹ {txn.amount}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'history' && (
          <SafeAreaView className="flex-1 bg-gray-50 px-6 pt-4">
            <Text className="text-gray-900 text-2xl font-bold mb-4">Transaction History</Text>

            {/* Search Bar */}
            <View className="bg-white px-4 py-2.5 rounded-2xl border border-gray-200 flex-row items-center space-x-2 mb-4">
              <Search size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Search transactions..."
                value={historySearch}
                onChangeText={setHistorySearch}
                className="flex-1 text-sm text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
              {historySearch.length > 0 && (
                <TouchableOpacity onPress={() => setHistorySearch('')}>
                  <X size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Pills */}
            <View className="flex-row space-x-2 mb-4">
              <TouchableOpacity
                onPress={() => setHistoryFilter('all')}
                className={`px-4 py-2 rounded-full border ${historyFilter === 'all' ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-xs font-semibold ${historyFilter === 'all' ? 'text-white' : 'text-gray-600'}`}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setHistoryFilter('debit')}
                className={`px-4 py-2 rounded-full border ${historyFilter === 'debit' ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-xs font-semibold ${historyFilter === 'debit' ? 'text-white' : 'text-gray-600'}`}>
                  Paid
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setHistoryFilter('credit')}
                className={`px-4 py-2 rounded-full border ${historyFilter === 'credit' ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-xs font-semibold ${historyFilter === 'credit' ? 'text-white' : 'text-gray-600'}`}>
                  Received
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transaction List */}
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-24">
              {filteredTransactions.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-gray-400 text-sm">No transactions found</Text>
                </View>
              ) : (
                filteredTransactions.map((txn, index) => {
                  const isDebit = txn.type === 'transfer' || txn.type === 'payment';
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedTxn(txn);
                        setActiveModal('txnDetail');
                      }}
                      className="bg-white p-4 rounded-2xl border border-gray-100 mb-3 flex-row items-center justify-between shadow-sm"
                    >
                      <View className="flex-row items-center space-x-3">
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${isDebit ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          {isDebit ? <ArrowUpRight size={18} color="#EF4444" /> : <ArrowDownLeft size={18} color="#10B981" />}
                        </View>
                        <View>
                          <Text className="text-gray-900 font-bold text-sm">{txn.title}</Text>
                          <Text className="text-gray-400 text-xs mt-0.5">
                            {dayjs(txn.createdAt).format('DD MMM YYYY, hh:mm A')}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className={`font-bold text-sm ${isDebit ? 'text-gray-900' : 'text-emerald-600'}`}>
                          {isDebit ? '-' : '+'}₹ {txn.amount}
                        </Text>
                        <Text className="text-emerald-600 text-[10px] font-semibold mt-0.5">Successful</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </SafeAreaView>
        )}

        {/* --- OFFERS TAB --- */}
        {activeTab === 'offers' && (
          <SafeAreaView className="flex-1 bg-white px-6 pt-6">
            <Text className="text-gray-900 text-2xl font-bold mb-4">Rewards & Offers</Text>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-24">
              <View className="bg-gradient-to-r bg-indigo-600 p-6 rounded-3xl mb-4 shadow-md">
                <Tag size={32} color="#FFFFFF" />
                <Text className="text-white font-extrabold text-xl mt-3">Flat ₹100 Cashback</Text>
                <Text className="text-indigo-100 text-xs mt-1">On your first 3 UPI transfers with DEV PAY.</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SendMoney')} className="bg-white py-2 px-4 rounded-xl self-start mt-4">
                  <Text className="text-indigo-700 font-bold text-xs">Pay Now</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-purple-50 p-5 rounded-2xl border border-purple-100 mb-4">
                <Text className="text-purple-900 font-bold text-base">5% Off Electricity Bills</Text>
                <Text className="text-purple-700 text-xs mt-1">Use code DEVPAY50 on bill payments.</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}

        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
          <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
              <Text className="text-gray-900 text-2xl font-bold mb-6 text-center">Profile</Text>

              {/* Profile Card */}
              <View className="items-center mb-6">
                <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center border-4 border-indigo-200 mb-3">
                  <Text className="text-indigo-700 font-bold text-3xl">{firstName.charAt(0)}</Text>
                </View>
                <Text className="text-gray-900 font-bold text-xl">{firstName} {lastName}</Text>
                <Text className="text-indigo-600 text-xs font-semibold mt-1">{upiId}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{profile?.email || 'user@devpay.com'}</Text>
              </View>

              {/* Add Account Directly Below Profile Info */}
              <TouchableOpacity
                onPress={handleOpenAddAccount}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center justify-between mb-4 shadow-sm"
              >
                <View className="flex-row items-center space-x-3">
                  <Plus size={20} color="#4F46E5" />
                  <Text className="text-indigo-600 font-bold text-base">Add Account</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Functional Profile Options */}
              <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
                <TouchableOpacity onPress={() => setActiveModal('security')} className="p-4 flex-row items-center justify-between border-b border-gray-100">
                  <View className="flex-row items-center space-x-3">
                    <Shield size={20} color="#4F46E5" />
                    <Text className="text-gray-900 font-medium text-base">Security</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveModal('settings')} className="p-4 flex-row items-center justify-between border-b border-gray-100">
                  <View className="flex-row items-center space-x-3">
                    <Settings size={20} color="#4F46E5" />
                    <Text className="text-gray-900 font-medium text-base">Settings</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveModal('support')} className="p-4 flex-row items-center justify-between border-b border-gray-100">
                  <View className="flex-row items-center space-x-3">
                    <HelpCircle size={20} color="#4F46E5" />
                    <Text className="text-gray-900 font-medium text-base">Support & Help</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveModal('about')} className="p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3">
                    <Info size={20} color="#4F46E5" />
                    <Text className="text-gray-900 font-medium text-base">About DEV PAY</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Red Logout Card */}
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-50 border border-red-200 p-4 rounded-2xl flex-row items-center justify-center space-x-2 mb-28 shadow-sm"
              >
                <LogOut size={20} color="#EF4444" />
                <Text className="text-red-600 font-bold text-base">Logout</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </View>

      {/* --- BOTTOM TAB BAR --- */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex-row justify-around items-center pt-3 pb-7 px-4 shadow-2xl">
        <TouchableOpacity onPress={() => setActiveTab('home')} className="items-center">
          <Home size={22} color={activeTab === 'home' ? '#4F46E5' : '#9CA3AF'} />
          <Text className={`text-xs mt-1 ${activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('history')} className="items-center">
          <History size={22} color={activeTab === 'history' ? '#4F46E5' : '#9CA3AF'} />
          <Text className={`text-xs mt-1 ${activeTab === 'history' ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
            History
          </Text>
        </TouchableOpacity>

        {/* Floating Scan QR Button */}
        <TouchableOpacity
          onPress={() => setActiveModal('scanQr')}
          className="-mt-7 w-14 h-14 bg-indigo-600 rounded-full justify-center items-center shadow-lg border-4 border-white"
        >
          <ScanLine size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('offers')} className="items-center">
          <Tag size={22} color={activeTab === 'offers' ? '#4F46E5' : '#9CA3AF'} />
          <Text className={`text-xs mt-1 ${activeTab === 'offers' ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
            Offers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('profile')} className="items-center">
          <User size={22} color={activeTab === 'profile' ? '#4F46E5' : '#9CA3AF'} />
          <Text className={`text-xs mt-1 ${activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL: PIN VERIFICATION (REAL BALANCE PROTECT) --- */}
      <Modal visible={activeModal === 'pinVerify'} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-xl">
            <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mb-3">
              <Lock size={24} color="#4F46E5" />
            </View>
            <Text className="text-gray-900 font-bold text-lg">Enter Transaction PIN</Text>
            <Text className="text-gray-500 text-xs text-center mt-1 mb-4">
              Enter your 4-digit MPIN to reveal account balance
            </Text>

            <TextInput
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={enteredPin}
              onChangeText={setEnteredPin}
              placeholder="••••"
              className="bg-gray-100 w-full py-3 text-center text-2xl font-bold rounded-xl tracking-widest text-gray-900 mb-2"
            />
            {pinError.length > 0 && <Text className="text-red-500 text-xs mb-3 font-medium">{pinError}</Text>}

            <View className="flex-row space-x-3 w-full mt-2">
              <TouchableOpacity
                onPress={() => setActiveModal('none')}
                className="flex-1 py-3 bg-gray-100 rounded-xl items-center"
              >
                <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleVerifyPinForBalance}
                disabled={verifyingPin}
                className="flex-1 py-3 bg-indigo-600 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-sm">{verifyingPin ? 'Verifying...' : 'Verify'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: BANK ACCOUNTS LIST --- */}
      <Modal visible={activeModal === 'bankAccounts'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-gray-900 font-bold text-xl">Linked Bank Accounts</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <Text className="text-indigo-600 font-bold text-base">Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {allAccounts.map((acc, idx) => (
                <View key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center space-x-3">
                      <View className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center">
                        <Text className="text-white font-bold text-xs">{acc?.bankId?.abbreviation || 'BANK'}</Text>
                      </View>
                      <View>
                        <Text className="text-gray-900 font-bold text-base">{acc?.bankId?.name || 'Bank Account'}</Text>
                        <Text className="text-gray-400 text-xs">Savings •••• {acc?.cardNumberLast4 || '1234'}</Text>
                      </View>
                    </View>
                    {idx === 0 && (
                      <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Text className="text-emerald-700 text-xs font-semibold">Primary</Text>
                      </View>
                    )}
                  </View>

                  <View className="pt-3 border-t border-gray-100 flex-row justify-between items-center">
                    <Text className="text-gray-500 text-xs">Available Balance</Text>
                    <Text className="text-gray-900 font-bold text-sm">
                      {showBalance ? `₹ ${acc.balance?.toLocaleString('en-IN')}` : '••••••••'}
                    </Text>
                  </View>

                  <View className="flex-row justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-3">
                    <TouchableOpacity
                      onPress={() => {
                        setActiveModal('none');
                        setActiveModal('miniStatement');
                      }}
                      className="items-center flex-1"
                    >
                      <FileText size={16} color="#4F46E5" />
                      <Text className="text-gray-700 text-[11px] font-medium mt-1">Mini Statement</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Alert.alert('Manage Account', `Managing ${acc?.bankId?.name}`)} className="items-center flex-1 border-x border-gray-200">
                      <Settings size={16} color="#4F46E5" />
                      <Text className="text-gray-700 text-[11px] font-medium mt-1">Manage</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { setActiveModal('none'); navigation.navigate('SendMoney'); }} className="items-center flex-1">
                      <Send size={16} color="#4F46E5" />
                      <Text className="text-gray-700 text-[11px] font-medium mt-1">UPI Transfer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={handleOpenAddAccount}
                className="border-2 border-dashed border-indigo-200 p-4 rounded-2xl items-center justify-center flex-row space-x-2 mt-2"
              >
                <Plus size={20} color="#4F46E5" />
                <Text className="text-indigo-600 font-bold text-sm">+ Add New Account</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: ADD ACCOUNT WIZARD --- */}
      <Modal visible={activeModal === 'addAccount'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-[85%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-xl">Select Bank</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Search bank name..."
              value={searchBankQuery}
              onChangeText={setSearchBankQuery}
              className="bg-gray-100 p-3 rounded-xl text-sm mb-4 text-gray-900"
            />

            {!selectedBankForAdd ? (
              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {availableBanks
                  .filter((b) => b.name.toLowerCase().includes(searchBankQuery.toLowerCase()))
                  .map((b, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedBankForAdd(b)}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2 flex-row justify-between items-center"
                    >
                      <View className="flex-row items-center space-x-3">
                        <View className="w-10 h-10 bg-indigo-600 rounded-full items-center justify-center">
                          <Text className="text-white font-bold text-xs">{b.abbreviation}</Text>
                        </View>
                        <Text className="text-gray-900 font-bold text-sm">{b.name}</Text>
                      </View>
                      <ChevronRight size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            ) : (
              <View className="flex-1">
                <View className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4 flex-row items-center space-x-3">
                  <View className="w-10 h-10 bg-indigo-600 rounded-full items-center justify-center">
                    <Text className="text-white font-bold text-xs">{selectedBankForAdd.abbreviation}</Text>
                  </View>
                  <Text className="text-indigo-900 font-bold text-base">{selectedBankForAdd.name}</Text>
                </View>

                <Text className="text-gray-700 text-xs font-semibold mb-1">Enter Account Number</Text>
                <TextInput
                  placeholder="e.g. 987654321012"
                  value={newAccNumber}
                  onChangeText={setNewAccNumber}
                  keyboardType="numeric"
                  className="bg-gray-100 p-4 rounded-2xl text-base font-bold mb-6 text-gray-900"
                />

                <TouchableOpacity
                  onPress={handleConfirmAddAccount}
                  disabled={linkingAccount}
                  className="bg-indigo-600 p-4 rounded-2xl items-center"
                >
                  <Text className="text-white font-bold text-base">
                    {linkingAccount ? 'Linking Account...' : 'Link Account'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedBankForAdd(null)} className="mt-3 p-3 items-center">
                  <Text className="text-gray-500 font-semibold text-xs">Choose Different Bank</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* --- MODAL: MY QR CODE --- */}
      <Modal visible={activeModal === 'myQr'} animationType="slide" transparent>
        <View className="flex-1 bg-black/90 justify-center p-6">
          <View className="bg-white rounded-3xl p-6 items-center">
            <View className="w-full flex-row justify-between items-center mb-6">
              <Text className="text-gray-900 font-bold text-xl">My QR Code</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* QR Card Container for capture */}
            <View ref={qrRef} collapsable={false} className="bg-white p-6 rounded-3xl items-center w-full mb-6" style={{ backgroundColor: 'white' }}>
              <View className="mb-4 bg-white p-2 border border-gray-100 rounded-2xl">
                {upiId ? (
                  <QRCode
                    value={`upi://pay?pa=${upiId}&pn=${firstName}%20${lastName}&mc=0000&mode=02&purpose=00`}
                    size={220}
                    color="#111827"
                    backgroundColor="#FFFFFF"
                    logoBackgroundColor="transparent"
                  />
                ) : (
                  <View className="w-[220px] h-[220px] items-center justify-center bg-gray-100 rounded-2xl">
                    <QrCode size={60} color="#9CA3AF" />
                  </View>
                )}
              </View>
              <Text className="text-gray-900 font-extrabold text-lg tracking-wide">{firstName} {lastName}</Text>
              <Text className="text-indigo-600 text-sm font-semibold mt-1 mb-2">{upiId || 'No UPI ID'}</Text>
              <View className="flex-row items-center justify-center w-full mt-2 border-t border-gray-100 pt-3">
                <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">DEV PAY SECURE QR</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-center w-full mb-2 space-x-6">
              <TouchableOpacity onPress={handleCopyUPI} className="items-center">
                <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center border border-indigo-100 mb-2">
                  <Copy size={24} color="#4F46E5" />
                </View>
                <Text className="text-gray-700 text-xs font-semibold">Copy ID</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDownloadQR} className="items-center">
                <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center border border-indigo-100 mb-2">
                  <Download size={24} color="#4F46E5" />
                </View>
                <Text className="text-gray-700 text-xs font-semibold">Download</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleShareQR} className="items-center">
                <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center border border-indigo-100 mb-2">
                  <Share2 size={24} color="#4F46E5" />
                </View>
                <Text className="text-gray-700 text-xs font-semibold">Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: SCAN QR SIMULATOR --- */}
      <Modal visible={activeModal === 'scanQr'} animationType="slide" transparent>
        <View className="flex-1 bg-black/90 justify-between p-6">
          <View className="flex-row justify-between items-center pt-8">
            <Text className="text-white font-bold text-xl">Scan & Pay</Text>
            <TouchableOpacity onPress={() => setActiveModal('none')}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Scanner Viewfinder Box */}
          <View className="items-center">
            <View className="w-64 h-64 border-4 border-indigo-500 rounded-3xl items-center justify-center relative overflow-hidden bg-black/40">
              <ScanLine size={120} color="#4F46E5" />
              <View className="absolute bottom-4 bg-indigo-600/80 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Align QR inside frame</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleSimulateScan('rahul.sharma@upi')}
              className="bg-indigo-600 px-6 py-3 rounded-2xl mt-8 flex-row items-center space-x-2"
            >
              <Camera size={18} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm">Simulate Scan (Rahul)</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center pb-8">
            <Text className="text-gray-400 text-xs">DEV PAY Instant Scanner v1.0</Text>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: NOTIFICATIONS --- */}
      <Modal visible={activeModal === 'notifications'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-[75%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-xl">Notifications</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {notifications.length === 0 ? (
                <Text className="text-gray-400 text-center py-8">No notifications</Text>
              ) : (
                notifications.map((n, idx) => (
                  <View key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2.5">
                    <Text className="text-gray-900 font-bold text-sm">{n.title}</Text>
                    <Text className="text-gray-600 text-xs mt-1">{n.message}</Text>
                    <Text className="text-gray-400 text-[10px] mt-2">{dayjs(n.createdAt).format('DD MMM, hh:mm A')}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: TRANSACTION DETAIL RECEIPT --- */}
      <Modal visible={activeModal === 'txnDetail'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-xl">Transaction Receipt</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedTxn && (
              <View className="items-center my-4">
                <View className="w-16 h-16 bg-emerald-50 rounded-full items-center justify-center border border-emerald-200 mb-3">
                  <CheckCircle2 size={36} color="#10B981" />
                </View>
                <Text className="text-gray-900 font-extrabold text-3xl">₹ {selectedTxn.amount}</Text>
                <Text className="text-emerald-600 font-bold text-xs mt-1">Payment Successful</Text>

                <View className="bg-gray-50 p-4 rounded-2xl w-full mt-6 border border-gray-100 space-y-3">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400 text-xs">Title</Text>
                    <Text className="text-gray-900 font-semibold text-xs">{selectedTxn.title}</Text>
                  </View>
                  <View className="flex-row justify-between pt-2 border-t border-gray-200">
                    <Text className="text-gray-400 text-xs">Reference ID</Text>
                    <Text className="text-gray-900 font-semibold text-xs">{selectedTxn.referenceId || 'TXN987654'}</Text>
                  </View>
                  <View className="flex-row justify-between pt-2 border-t border-gray-200">
                    <Text className="text-gray-400 text-xs">Date & Time</Text>
                    <Text className="text-gray-900 font-semibold text-xs">
                      {dayjs(selectedTxn.createdAt).format('DD MMM YYYY, hh:mm A')}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* --- MODAL: SECURITY (CHANGE PIN) --- */}
      <Modal visible={activeModal === 'security'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-xl">Security & PIN</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-700 font-bold text-sm mb-2">Update 4-Digit Transaction PIN</Text>
            <TextInput
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              placeholder="New PIN"
              value={newPinInput}
              onChangeText={setNewPinInput}
              className="bg-gray-100 p-3 rounded-xl mb-3 text-center text-lg font-bold text-gray-900"
            />
            <TextInput
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              placeholder="Confirm New PIN"
              value={confirmPinInput}
              onChangeText={setConfirmPinInput}
              className="bg-gray-100 p-3 rounded-xl mb-4 text-center text-lg font-bold text-gray-900"
            />

            <TouchableOpacity onPress={handleChangePin} className="bg-indigo-600 p-4 rounded-2xl items-center">
              <Text className="text-white font-bold text-base">Update PIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: VAULT --- */}
      <Modal visible={activeModal === 'vault'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-xl">DEV PAY Savings Vault</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 items-center my-4">
              <Lock size={40} color="#4F46E5" />
              <Text className="text-indigo-900 font-extrabold text-lg mt-3">Vault Balance: ₹ 25,000</Text>
              <Text className="text-indigo-600 text-xs text-center mt-1">
                7.5% p.a. interest earned daily on auto-vaulted savings.
              </Text>
            </View>

            <TouchableOpacity onPress={() => Alert.alert('Vault Deposit', 'Added ₹1,000 to Vault')} className="bg-indigo-600 p-4 rounded-2xl items-center">
              <Text className="text-white font-bold text-base">Deposit to Vault</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: SUPPORT & HELP --- */}
      <Modal visible={activeModal === 'support'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-xl">Support & Help</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-3 flex-row items-center space-x-3">
              <Phone size={20} color="#4F46E5" />
              <View>
                <Text className="text-gray-900 font-bold text-sm">24x7 Customer Helpline</Text>
                <Text className="text-gray-500 text-xs">1800-123-DEVPAY (Toll-Free)</Text>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4 flex-row items-center space-x-3">
              <Mail size={20} color="#4F46E5" />
              <View>
                <Text className="text-gray-900 font-bold text-sm">Email Support</Text>
                <Text className="text-gray-500 text-xs">support@devpay.com</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: SETTINGS --- */}
      <Modal visible={activeModal === 'settings'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-xl">Settings</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex-row justify-between items-center mb-3">
              <Text className="text-gray-900 font-bold text-sm">Push Notifications</Text>
              <Text className="text-emerald-600 font-bold text-xs">Enabled</Text>
            </View>

            <View className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-sm">App Language</Text>
              <Text className="text-indigo-600 font-bold text-xs">English (US)</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: ABOUT DEV PAY --- */}
      <Modal visible={activeModal === 'about'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 items-center">
            <View className="w-full flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-xl">About DEV PAY</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center my-3 shadow-md">
              <Text className="text-white font-extrabold text-xl">DEV</Text>
            </View>

            <Text className="text-gray-900 font-bold text-lg">DEV PAY Digital Banking</Text>
            <Text className="text-gray-400 text-xs mt-0.5">Version 1.0.0 (Production Build)</Text>

            <Text className="text-gray-500 text-xs text-center my-4 leading-5">
              DEV PAY is a next-generation fintech application built with enterprise-grade encryption and real-time bank account management.
            </Text>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: MINI STATEMENT --- */}
      <Modal visible={activeModal === 'miniStatement'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-[85%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-xl">{bankName}</Text>
              <TouchableOpacity onPress={() => setActiveModal('none')}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="bg-indigo-600 p-5 rounded-2xl mb-6 shadow-md">
              <Text className="text-indigo-200 text-xs">Savings Account •••• {last4}</Text>
              <Text className="text-white text-xs mt-3">Available Balance</Text>
              <Text className="text-white text-3xl font-extrabold mt-1">{balance}</Text>
              <View className="mt-4 bg-indigo-500/40 py-1.5 px-3 rounded-full self-start">
                <Text className="text-emerald-300 text-xs font-semibold">✓ Account is Active</Text>
              </View>
            </View>

            <Text className="text-gray-900 font-bold text-base mb-3">Mini Statement</Text>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {transactions.map((txn, index) => {
                const isDebit = txn.type === 'transfer' || txn.type === 'payment';
                return (
                  <View key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-3">
                      <View className={`w-10 h-10 rounded-full items-center justify-center ${isDebit ? 'bg-red-50' : 'bg-emerald-50'}`}>
                        {isDebit ? <ArrowUpRight size={18} color="#EF4444" /> : <ArrowDownLeft size={18} color="#10B981" />}
                      </View>
                      <View>
                        <Text className="text-gray-900 font-bold text-sm">{txn.title}</Text>
                        <Text className="text-gray-400 text-xs">{dayjs(txn.createdAt).format('DD MMM, hh:mm A')}</Text>
                      </View>
                    </View>
                    <Text className={`font-bold text-sm ${isDebit ? 'text-gray-900' : 'text-emerald-600'}`}>
                      {isDebit ? '-' : '+'}₹ {txn.amount}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DashboardScreen;
