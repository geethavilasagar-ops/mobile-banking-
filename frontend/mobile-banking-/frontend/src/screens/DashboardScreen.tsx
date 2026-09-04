import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, RefreshControl, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Bell, Send, ArrowDownToLine, ScanLine, QrCode, CreditCard, History, Home, PieChart, Settings, LogOut } from 'lucide-react-native';
import apiClient, { setAuthToken } from '../api/client';
import dayjs from 'dayjs';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>; };

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<any>(null);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, txRes] = await Promise.all([
        apiClient.get('/user/profile'),
        apiClient.get('/transactions/history?limit=5')
      ]);
      setProfile(profileRes.data.data.user);
      setBankAccount(profileRes.data.data.bankAccount);
      setTransactions(txRes.data.data.transactions);
    } catch (err: any) {
      // Avoid spamming alerts, just log
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
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => {
        setAuthToken('');
        navigation.replace('Login');
      }}
    ]);
  };

  const balance = bankAccount ? `₹ ${bankAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "₹ 0.00";
  const firstName = profile?.firstName || 'User';
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <View className="flex-row items-center space-x-3">
          <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center border border-indigo-200">
            <Text className="text-indigo-700 font-bold text-lg">{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs">Good Morning,</Text>
            <Text className="text-gray-900 font-bold text-lg">{firstName} {profile?.lastName}</Text>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm">
          <Bell size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Balance Card */}
        <View className="mt-6 rounded-3xl overflow-hidden shadow-lg shadow-indigo-500/30">
          <View className="bg-indigo-600 p-6 relative">
            <View className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/50 rounded-full" />
            <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-700/50 rounded-full" />
            
            <View className="flex-row justify-between items-center mb-6 z-10">
              <Text className="text-indigo-100 text-sm font-medium">Total Balance</Text>
              <View className="bg-indigo-500/40 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">{bankAccount?.bankId?.abbreviation || 'BANK'}</Text>
              </View>
            </View>
            <Text className="text-white text-4xl font-extrabold tracking-tight z-10">{balance}</Text>
            <Text className="text-indigo-200 text-xs mt-1 z-10">**** **** **** {bankAccount?.cardNumberLast4 || '0000'}</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View className="mt-8 flex-row justify-between">
          <ActionItem icon={<Send size={24} color="#4F46E5" />} label="Send" onPress={() => navigation.navigate('SendMoney')} />
          <ActionItem icon={<ArrowDownToLine size={24} color="#4F46E5" />} label="Receive" />
          <ActionItem icon={<ScanLine size={24} color="#4F46E5" />} label="Scan" />
          <ActionItem icon={<QrCode size={24} color="#4F46E5" />} label="QR Code" />
        </View>

        {/* Recent Transactions */}
        <View className="mt-10 mb-6 flex-row justify-between items-center">
          <Text className="text-gray-900 font-bold text-lg">Recent Transactions</Text>
          <TouchableOpacity>
            <Text className="text-indigo-600 font-semibold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-4 pb-24">
          {transactions.length === 0 ? (
             <Text className="text-gray-500 text-center py-4">No recent transactions</Text>
          ) : (
            transactions.map((txn, index) => {
              const isDebit = txn.type === 'transfer' || txn.type === 'payment';
              return (
                <TransactionItem 
                  key={index}
                  title={txn.title} 
                  date={dayjs(txn.createdAt).format('DD MMM, hh:mm A')} 
                  amount={`${isDebit ? '-' : '+'}₹ ${txn.amount}`} 
                  icon={isDebit ? <CreditCard size={20} color="#EF4444" /> : <ArrowDownToLine size={20} color="#10B981" />}
                  color={isDebit ? "bg-red-50" : "bg-green-50"}
                  amountColor={isDebit ? "text-gray-900" : "text-green-600"}
                />
              )
            })
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex-row justify-around items-center pt-4 pb-8 px-4 shadow-xl">
        <TouchableOpacity className="items-center">
          <Home size={24} color="#4F46E5" />
          <Text className="text-indigo-600 text-xs font-bold mt-1">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <History size={24} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs mt-1">History</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center -mt-8 w-14 h-14 bg-indigo-600 rounded-full justify-center shadow-lg shadow-indigo-500/40 border-4 border-white">
          <ScanLine size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <PieChart size={24} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs mt-1">Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={handleLogout}>
          <LogOut size={24} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs mt-1">Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ActionItem = ({ icon, label, onPress }: { icon: React.ReactNode, label: string, onPress?: () => void }) => (
  <TouchableOpacity className="items-center space-y-2" onPress={onPress}>
    <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center shadow-sm border border-gray-100">
      {icon}
    </View>
    <Text className="text-gray-700 font-medium text-xs">{label}</Text>
  </TouchableOpacity>
);

const TransactionItem = ({ title, date, amount, icon, color, amountColor }: any) => (
  <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3">
    <View className={`w-12 h-12 rounded-full items-center justify-center ${color}`}>
      {icon}
    </View>
    <View className="flex-1 ml-4">
      <Text className="text-gray-900 font-bold text-base">{title}</Text>
      <Text className="text-gray-500 text-xs mt-0.5">{date}</Text>
    </View>
    <View className="items-end">
      <Text className={`font-bold text-base ${amountColor}`}>{amount}</Text>
    </View>
  </TouchableOpacity>
);

export default DashboardScreen;
