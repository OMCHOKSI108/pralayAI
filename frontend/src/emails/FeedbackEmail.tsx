import { Html, Head, Body, Container, Heading, Text, Button, Hr, Section } from '@react-email/components';

interface FeedbackEmailProps {
  studentName: string;
  projectName: string;
  status: 'approved' | 'changes_requested' | 'rejected';
  feedbackText: string;
  dashboardUrl: string;
}

export default function FeedbackEmail({ studentName, projectName, status, feedbackText, dashboardUrl }: FeedbackEmailProps) {
  const statusEmoji = status === 'approved' ? '🎉' : status === 'changes_requested' ? '🔄' : '❌';
  const statusColor = status === 'approved' ? '#22c55e' : status === 'changes_requested' ? '#f59e0b' : '#ef4444';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{statusEmoji} Review Complete</Heading>
          <Text style={text}>Hi {studentName},</Text>
          <Section style={statusBox}>
            <Text style={{ ...statusText, color: statusColor }}>
              <strong>Status:</strong> {status.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={{ ...statusText }}><strong>Project:</strong> {projectName}</Text>
          </Section>
          {feedbackText && (
            <Section style={feedbackBox}>
              <Text style={feedbackLabel}><strong>Feedback:</strong></Text>
              <Text style={feedbackContent}>{feedbackText}</Text>
            </Section>
          )}
          {status === 'changes_requested' && (
            <Button href={dashboardUrl} style={button}>View Feedback & Make Changes</Button>
          )}
          {status === 'approved' && (
            <Button href={dashboardUrl} style={button}>View Your Certificate</Button>
          )}
          <Hr style={hr} />
          <Text style={footer}>Hellware — Build. Learn. Ship.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#0a0a0a', fontFamily: '-apple-system, sans-serif' };
const container = { maxWidth: '600px', margin: '0 auto', padding: '40px 20px' };
const heading = { color: '#ffffff', fontSize: '28px', marginTop: '24px' };
const text = { color: '#a1a1aa', fontSize: '16px', lineHeight: '24px' };
const statusBox = { backgroundColor: '#18181b', borderRadius: '8px', padding: '20px', margin: '24px 0' };
const statusText = { color: '#e4e4e7', fontSize: '14px', margin: '8px 0' };
const feedbackBox = { backgroundColor: '#1c1917', borderRadius: '8px', padding: '20px', margin: '16px 0' };
const feedbackText = { color: '#e4e4e7', fontSize: '14px', margin: '0 0 8px 0' };
const feedbackLabel = { color: '#e4e4e7', fontSize: '14px', margin: '0 0 8px 0' };
const feedbackContent = { color: '#a1a1aa', fontSize: '14px', fontStyle: 'italic' as const, margin: '0' };
const button = { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', marginTop: '24px' };
const hr = { borderColor: '#27272a', margin: '32px 0' };
const footer = { color: '#52525b', fontSize: '12px', textAlign: 'center' as const };
