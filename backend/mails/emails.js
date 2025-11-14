
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_TEMPLATE,
} from "./emailTemplates.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function addDomain() {
  try {
    const response = await resend.domains.create({
      name: 'mehmetguldeneme.shop',   // 👈 buraya kendi domainini yaz
    });

    console.log('Domain eklendi:', response);
  } catch (error) {
    console.error('Domain eklenirken hata:', error);
  }
}

addDomain();

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    await resend.emails.send({
      from: "noreply@mehmetguldeneme.shop",
      to: email,
      subject: "Email Verification",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    await resend.emails.send({
      from: "noreply@mehmetguldeneme.shop",
      to: email,
      subject: "Welcome to Our Service",
      html: WELCOME_TEMPLATE,
    });
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error(`Error sending welcome email`, error);

    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
 

  try {
    await resend.emails.send({
      from:  "noreply@mehmetguldeneme.shop",
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });
  } catch (error) {
    console.error(`Error sending password reset email`, error);

    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {


  try {
    await resend.emails.send({
      from: "noreply@mehmetguldeneme.shop",
      to: email,
      subject: "Password Reset Sucesful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    
    });

    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
