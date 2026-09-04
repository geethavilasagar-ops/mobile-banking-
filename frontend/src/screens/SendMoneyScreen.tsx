import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import InputField from '../components/InputField';
import Button from '../components/Button';
import apiClient from '../api/client';
import { ArrowLeft, User, X } from 'lucide-react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';

type Props = NativeStackScreenProps<RootStackParamList, 'SendMoney'>;

interface FormValues {
  receiverUpiId: string;
  amount: string;
  title: string;
  pin: string;
}

const SendMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<FormValues | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      receiverUpiId: '',
      amount: '',
      title: '',
      pin: '',
    },
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await apiClient.get('/user/recent-contacts');
        setRecentContacts(res.data.data.contacts || []);
      } catch (err) {
        console.error('Failed to fetch recent contacts:', err);
      }
    };
    fetchContacts();
  }, []);

  const onPreSubmit = (data: FormValues) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const onConfirmPay = async () => {
    if (!pendingData) return;

    setLoading(true);
    setShowConfirm(false);

    try {
      const payload: any = {
        amount: parseFloat(pendingData.amount),
        title: pendingData.title.trim(),
        pin: pendingData.pin,
        paymentMethod: 'upi',
        receiverUpiId: pendingData.receiverUpiId.trim(),
      };

      await apiClient.post('/transactions/transfer', payload);

      Alert.alert(
        "Transfer Successful",
        "Money has been sent securely.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Dashboard")
          }
        ]
      );
    } catch (err: any) {
      Alert.alert('Transfer Failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      setPendingData(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Navigation Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
            <ArrowLeft size={24} color="#4F46E5" />
          </TouchableOpacity>
          <Text className="text-gray-900 font-bold text-lg">Send Money</Text>
          <View className="w-6" />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Recipient UPI ID Input */}
          <Controller
            control={control}
            name="receiverUpiId"
            rules={{
              required: 'UPI ID is required',
              pattern: { value: /^[\w.-]+@[\w.-]+$/, message: 'Invalid UPI ID format' }
            }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Recipient UPI ID"
                placeholder="username@devpay"
                value={value}
                onChangeText={onChange}
                error={errors.receiverUpiId?.message}
                rightIcon={<User size={20} color="#4F46E5" />}
                autoCapitalize="none"
              />
            )}
          />

          {/* Recent Contacts */}
          {recentContacts.length > 0 && (
            <>
              <Text className="text-gray-900 font-bold text-sm mt-2 mb-3">Recent Contacts</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-4 mb-6 py-1">
                {recentContacts.map((contact, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setValue('receiverUpiId', contact.handle)}
                    className="items-center mr-4"
                  >
                    <View className="w-14 h-14 bg-indigo-100 rounded-full items-center justify-center border-2 border-indigo-200 mb-1">
                      <Text className="text-indigo-700 font-bold text-base">{contact.initial}</Text>
                    </View>
                    <Text className="text-gray-700 text-xs font-medium">{contact.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Shared Fields */}
          <Controller
            control={control}
            name="amount"
            rules={{ required: 'Amount is required', min: { value: 1, message: 'Minimum ₹1' } }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Amount (₹)"
                placeholder="2,000"
                value={value}
                onChangeText={onChange}
                error={errors.amount?.message}
                keyboardType="numeric"
              />
            )}
          />

          <Controller
            control={control}
            name="title"
            rules={{ required: 'Title is required' }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="Add a note (optional)"
                placeholder="Dinner 🍲"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="pin"
            rules={{ required: '4-Digit Transaction PIN is required', minLength: 4, maxLength: 4 }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="4-Digit Transaction PIN"
                placeholder="••••"
                value={value}
                onChangeText={onChange}
                error={errors.pin?.message}
                keyboardType="numeric"
                secureTextEntry
              />
            )}
          />

          <View className="mt-4">
            <Button title="Proceed to Pay" onPress={handleSubmit(onPreSubmit)} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Confirm Payment</Text>
              <TouchableOpacity onPress={() => setShowConfirm(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {pendingData && (
              <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                <Text className="text-sm text-gray-500 mb-1">Paying To</Text>
                <Text className="text-lg font-bold text-gray-900 mb-3">{pendingData.receiverUpiId}</Text>

                <Text className="text-sm text-gray-500 mb-1">Amount</Text>
                <Text className="text-2xl font-bold text-indigo-600">₹{parseFloat(pendingData.amount).toLocaleString('en-IN')}</Text>
              </View>
            )}

            <Button title="Confirm & Pay" onPress={onConfirmPay} />
            <TouchableOpacity onPress={() => setShowConfirm(false)} className="mt-4 py-3 items-center">
              <Text className="text-gray-500 font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default function SendMoneyScreenWrapper(props: Props) {
  return (
    <ErrorBoundary>
      <SendMoneyScreen {...props} />
    </ErrorBoundary>
  );
}

