import { Html, Head, Body, Container, Heading, Text, Hr, Section } from '@react-email/components';

interface ContributionConfirmationEmailProps {
  studentName: string;
  amount: number;
  paymentId: string;
}

export default function ContributionConfirmationEmail({ studentName, amount, paymentId }: ContributionConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Contribution Confirmed</Heading>
          <Text style={text}>Hi {studentName},</Text>
          <Text style={text}>Thank you for your contribution of <strong>₹{amount}</strong> to Hellware.</Text>
          <Section style={detailsBox}>
            <Text style={detailText}><strong>Amount:</strong> ₹{amount}</Text>
            <Text style={detailText}><strong>Payment ID:</strong> {paymentId}</Text>
            <Text style={detailText}><strong>Status:</strong> Confirmed</Text>
          </Section>
          <Text style={text}>Your certificate is being processed and will be available in your dashboard shortly.</Text>
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
const detailsBox = { backgroundColor: '#18181b', borderRadius: '8px', padding: '20px', margin: '24px 0' };
const detailText = { color: '#e4e4e7', fontSize: '14px', margin: '8px 0' };
const hr = { borderColor: '#27272a', margin: '32px 0' };
const footer = { color: '#52525b', fontSize: '12px', textAlign: 'center' as const };
