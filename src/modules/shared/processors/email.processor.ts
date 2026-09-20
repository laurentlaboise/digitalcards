import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'welcome-email':
        await this.sendWelcomeEmail(job.data);
        break;
      case 'lead-followup':
        await this.sendLeadFollowup(job.data);
        break;
      case 'team-invite':
        await this.sendTeamInvite(job.data);
        break;
      case 'analytics-report':
        await this.sendAnalyticsReport(job.data);
        break;
      case 'order-confirmation':
        await this.sendOrderConfirmation(job.data);
        break;
      case 'shipping-notification':
        await this.sendShippingNotification(job.data);
        break;
      case 'password-reset':
        await this.sendPasswordReset(job.data);
        break;
      case 'email-verification':
        await this.sendEmailVerification(job.data);
        break;
      default:
        this.logger.warn(`Unknown email job: ${job.name}`);
    }
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const apiKey = this.configService.get('email.resendApiKey');
    const from = this.configService.get('email.from');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    this.logger.log(`Email sent to ${to}: ${subject}`);
  }

  private async sendWelcomeEmail(data: { email: string; name?: string }): Promise<void> {
    await this.sendEmail(
      data.email,
      'Welcome to TapCard!',
      `<h1>Welcome${data.name ? `, ${data.name}` : ''}!</h1>
       <p>Thanks for joining TapCard. Create your first digital business card to get started.</p>
       <a href="${this.configService.get('urls.frontend')}/dashboard">Go to Dashboard</a>`,
    );
  }

  private async sendLeadFollowup(data: {
    recipientEmail: string;
    profileName: string;
    templateHtml?: string;
    submissionData: Record<string, any>;
  }): Promise<void> {
    const html = data.templateHtml || `
      <h2>Thanks for connecting with ${data.profileName}</h2>
      <p>We appreciate your interest. We'll be in touch soon!</p>`;
    await this.sendEmail(data.recipientEmail, `Follow up from ${data.profileName}`, html);
  }

  private async sendTeamInvite(data: {
    email: string;
    organizationName: string;
    inviterName: string;
    inviteToken: string;
  }): Promise<void> {
    const inviteUrl = `${this.configService.get('urls.frontend')}/invite/${data.inviteToken}`;
    await this.sendEmail(
      data.email,
      `You've been invited to join ${data.organizationName}`,
      `<h2>Team Invitation</h2>
       <p>${data.inviterName} has invited you to join <strong>${data.organizationName}</strong> on TapCard.</p>
       <a href="${inviteUrl}">Accept Invitation</a>`,
    );
  }

  private async sendAnalyticsReport(data: {
    email: string;
    profileName: string;
    summary: Record<string, any>;
  }): Promise<void> {
    await this.sendEmail(
      data.email,
      `Analytics Report for ${data.profileName}`,
      `<h2>Analytics Summary</h2>
       <ul>
         <li>Views: ${data.summary.views || 0}</li>
         <li>Clicks: ${data.summary.clicks || 0}</li>
         <li>Leads: ${data.summary.leads || 0}</li>
       </ul>`,
    );
  }

  private async sendOrderConfirmation(data: {
    email: string;
    orderId: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<void> {
    const itemsHtml = data.items
      .map((item) => `<li>${item.name} x${item.quantity} - $${item.price.toFixed(2)}</li>`)
      .join('');
    await this.sendEmail(
      data.email,
      `Order Confirmation #${data.orderId.substring(0, 8)}`,
      `<h2>Order Confirmed</h2>
       <ul>${itemsHtml}</ul>
       <p><strong>Total: $${data.total.toFixed(2)}</strong></p>`,
    );
  }

  private async sendShippingNotification(data: {
    email: string;
    orderId: string;
    trackingNumber: string;
    carrier?: string;
  }): Promise<void> {
    await this.sendEmail(
      data.email,
      `Your order has shipped!`,
      `<h2>Shipping Update</h2>
       <p>Your order #${data.orderId.substring(0, 8)} has been shipped.</p>
       <p>Tracking Number: <strong>${data.trackingNumber}</strong></p>
       ${data.carrier ? `<p>Carrier: ${data.carrier}</p>` : ''}`,
    );
  }

  private async sendPasswordReset(data: {
    email: string;
    resetToken: string;
  }): Promise<void> {
    const resetUrl = `${this.configService.get('urls.frontend')}/reset-password/${data.resetToken}`;
    await this.sendEmail(
      data.email,
      'Reset Your Password',
      `<h2>Password Reset</h2>
       <p>Click the link below to reset your password. This link expires in 1 hour.</p>
       <a href="${resetUrl}">Reset Password</a>`,
    );
  }

  private async sendEmailVerification(data: {
    email: string;
    verificationToken: string;
  }): Promise<void> {
    const verifyUrl = `${this.configService.get('urls.frontend')}/verify-email/${data.verificationToken}`;
    await this.sendEmail(
      data.email,
      'Verify Your Email',
      `<h2>Email Verification</h2>
       <p>Click the link below to verify your email address.</p>
       <a href="${verifyUrl}">Verify Email</a>`,
    );
  }
}
