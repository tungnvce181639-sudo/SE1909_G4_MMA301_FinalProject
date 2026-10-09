import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const suggestions = [
  { icon: 'laptop-outline', label: 'Mẹo kiểm tra laptop cũ?' },
  { icon: 'pricetag-outline', label: 'Định giá giáo trình' },
  { icon: 'shield-checkmark-outline', label: 'Giao dịch an toàn' },
];

const initialMessages = [
  {
    id: 'welcome',
    sender: 'bot',
    text: 'Chào bạn! Mình là AI Trợ lý Chợ Sinh Viên. Bạn cần hỗ trợ kiểm tra đồ công nghệ, định giá hay mẹo giao dịch an toàn tại KTX hôm nay?',
    time: 'Bây giờ',
  },
  {
    id: 'checklist',
    sender: 'bot',
    text: 'Bạn có thể hỏi mình về laptop, giáo trình, đồ dùng KTX hoặc cách giao dịch an toàn trong khuôn viên trường.',
    time: 'Bây giờ',
  },
];

const getReply = (message) => {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('laptop')) {
    return 'Khi test laptop cũ, hãy kiểm tra ngoại hình, điểm chết màn hình, bàn phím, pin, nhiệt độ và tất cả cổng kết nối. Bạn nên mở máy ít nhất 15 phút và kiểm tra serial, hóa đơn hoặc thời hạn bảo hành trước khi thanh toán.';
  }
  if (normalizedMessage.includes('giáo trình') || normalizedMessage.includes('định giá')) {
    return 'Để định giá giáo trình, hãy xem năm xuất bản, tình trạng sách, mức độ ghi chú và giá các bài đăng tương tự. Sách còn mới, đủ phụ lục và có note hữu ích thường có thể bán ở mức 50-70% giá mua.';
  }
  if (normalizedMessage.includes('an toàn') || normalizedMessage.includes('giao dịch')) {
    return 'Bạn nên hẹn gặp ở nơi đông người như sảnh KTX, thư viện hoặc Canteen Hola. Kiểm tra hàng trước, chỉ chuyển khoản sau khi nhận đủ đồ và không chia sẻ mã OTP cho người khác.';
  }

  return 'Mình đã ghi nhận câu hỏi của bạn. Hãy cho mình biết thêm tên sản phẩm, tình trạng và mức giá người bán đưa ra để mình tư vấn sát hơn nhé!';
};

export default function AIChatbotScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages]);

  const sendMessage = (message = inputMessage) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmedMessage,
      time: 'Bây giờ',
    };
    const assistantMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      text: getReply(trimmedMessage),
      time: 'Bây giờ',
    };

    setMessages((currentMessages) => [...currentMessages, userMessage, assistantMessage]);
    setInputMessage('');
  };

  const renderMessage = ({ item }) => {
    const isUserMessage = item.sender === 'user';

    return (
      <View style={[styles.messageRow, isUserMessage && styles.userMessageRow]}>
        {!isUserMessage && (
          <View style={[styles.messageAvatar, { backgroundColor: primaryColor }]}>
            <Ionicons name="sparkles" size={15} color="#ffffff" />
          </View>
        )}
        <View style={[styles.messageContent, isUserMessage && styles.userMessageContent]}>
          <View style={styles.messageMeta}>
            <Text style={[styles.sender, { color: isUserMessage ? primaryColor : theme.textSecondary }]}>
              {isUserMessage ? 'Bạn' : 'Campus AI'}
            </Text>
            <Text style={[styles.time, { color: theme.textSecondary }]}>{item.time}</Text>
          </View>
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isUserMessage ? primaryColor : theme.card,
                borderColor: isUserMessage ? primaryColor : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: isUserMessage ? '#ffffff' : theme.text, fontSize: 14 * fontSizeScale },
              ]}
            >
              {item.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerIdentity}>
            <View style={[styles.headerAvatar, { backgroundColor: '#0031e8' }]}>
              <Ionicons name="hardware-chip" size={21} color="#ffffff" />
              <View style={[styles.onlineDot, { borderColor: theme.background }]} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
                Trợ lý AI Campus
              </Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={[styles.statusText, { color: '#008f70' }]}>Trực tuyến</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.headerButton} accessibilityLabel="Tùy chọn đoạn chat">
            <Ionicons name="ellipsis-vertical" size={21} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={[styles.welcomeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.welcomeIcon, { backgroundColor: `${primaryColor}20` }]}>
                <Ionicons name="hand-left-outline" size={24} color={primaryColor} />
              </View>
              <View style={styles.welcomeCopy}>
                <Text style={[styles.welcomeLabel, { color: primaryColor }]}>FPT CAMPUS HELPER</Text>
                <Text style={[styles.welcomeText, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
                  Hỏi nhanh về mua bán đồ dùng, định giá sản phẩm và mẹo giao dịch sinh viên.
                </Text>
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={styles.compliance}>
              <Ionicons name="shield-checkmark-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.complianceText, { color: theme.textSecondary }]}>
                AI phản hồi dựa trên kinh nghiệm thực tế và quy tắc giao dịch an toàn.
              </Text>
            </View>
          }
        />

        <View style={[styles.composerArea, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <FlatList
            horizontal
            data={suggestions}
            keyExtractor={(item) => item.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.suggestion, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => sendMessage(item.label)}
              >
                <Ionicons name={item.icon} size={15} color={primaryColor} />
                <Text style={[styles.suggestionText, { color: theme.text }]}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.composerRow}>
            <TouchableOpacity style={styles.attachButton} accessibilityLabel="Đính kèm tệp hoặc ảnh">
              <Ionicons name="attach-outline" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? theme.card : '#f3f3f7', borderColor: theme.border }]}>
              <TextInput
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Hỏi về giáo trình, đồ dùng..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, fontSize: 14 * fontSizeScale }]}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage()}
              />
              <TouchableOpacity accessibilityLabel="Nhập giọng nói">
                <Ionicons name="mic-outline" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: primaryColor, opacity: inputMessage.trim() ? 1 : 0.65 }]}
              onPress={() => sendMessage()}
              accessibilityLabel="Gửi tin nhắn"
            >
              <Ionicons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  header: {
    minHeight: 66,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 4, gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  onlineDot: { position: 'absolute', right: -1, bottom: 0, width: 11, height: 11, borderRadius: 6, backgroundColor: '#00aa89', borderWidth: 2 },
  headerTitle: { fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00aa89' },
  statusText: { fontSize: 10, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 12, gap: 14 },
  welcomeCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14, flexDirection: 'row', gap: 10 },
  welcomeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  welcomeCopy: { flex: 1, gap: 5 },
  welcomeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  welcomeText: { lineHeight: 20 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userMessageRow: { justifyContent: 'flex-end' },
  messageAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  messageContent: { maxWidth: '86%', gap: 4 },
  userMessageContent: { alignItems: 'flex-end' },
  messageMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  sender: { fontSize: 10, fontWeight: '700' },
  time: { fontSize: 10 },
  messageBubble: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 13, paddingVertical: 10 },
  messageText: { lineHeight: 20 },
  compliance: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingTop: 4 },
  complianceText: { fontSize: 10, textAlign: 'center', flexShrink: 1 },
  composerArea: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, paddingBottom: 8 },
  suggestionList: { paddingHorizontal: 12, gap: 8, paddingBottom: 8 },
  suggestion: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  suggestionText: { fontSize: 11, fontWeight: '600' },
  composerRow: { paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  attachButton: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  inputWrapper: { flex: 1, minHeight: 44, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, paddingVertical: 0 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
