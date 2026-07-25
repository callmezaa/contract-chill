import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const LegalPage = ({ title }: { title: string }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-12 transition-colors duration-500 bg-surface">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('legal.backToHome')}
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-text mb-3 tracking-tight">{title.toLowerCase()}</h1>
          <p className="text-sm font-medium text-text-subtle mb-8">last updated: {new Date().toLocaleDateString()}</p>
          <p className="text-xs text-text-subtle mb-12 italic">{t('legal.englishNote')}</p>
          
          <div className="flex flex-col gap-12 text-text-muted">
            {title.toLowerCase().includes('privacy') ? (
              <>
                <section>
                  <p className="text-lg leading-relaxed text-text font-medium">
                    Your privacy is critically important to us. At ContractChill, we are thoughtful about the personal information we ask you to provide and the personal information that we collect about you through the operation of our services.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-display font-bold text-text mb-4">document processing & ai</h2>
                  <p className="leading-relaxed">
                    When you upload a document for analysis, the text is extracted and temporarily sent to our AI provider (Google Gemini) to generate insights. We do not use your documents or the generated analysis to train public AI models. Your uploaded files are stored securely in Google Cloud Storage and can be deleted by you at any time.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-display font-bold text-text mb-4">information we collect</h2>
                  <p className="leading-relaxed">
                    We collect information that you provide directly to us, such as when you create an account, update your profile, or communicate with us. This includes your name, email address, and authentication credentials managed via Firebase.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-display font-bold text-text mb-4">data security</h2>
                  <p className="leading-relaxed">
                    We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. All communication between your browser and our servers is encrypted via HTTPS.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-display font-bold text-text mb-4">your data rights</h2>
                  <p className="leading-relaxed">
                    You have the right to access, correct, or delete your personal data. You can delete your analysis history directly from the History dashboard. If you wish to permanently delete your account and all associated data, please contact our support team.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <p className="text-lg leading-relaxed text-text font-medium">
                    These Terms of Service govern your use of the ContractChill website and the services provided by ContractChill. By using our services, you agree to these terms.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-display font-bold text-text mb-4">nature of the service</h2>
                  <p className="leading-relaxed">
                    ContractChill is an AI-powered document analysis tool designed to summarize and highlight potential issues in legal texts. <strong className="text-text font-semibold">ContractChill is not a law firm, and the service does not constitute legal advice.</strong> You should always consult with a qualified attorney for specific legal guidance.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-display font-bold text-text mb-4">user responsibilities</h2>
                  <p className="leading-relaxed">
                    You are responsible for your use of the Services and for any content you provide, including compliance with applicable laws, rules, and regulations. Do not upload highly sensitive, classified, or confidential information that you do not have the right to share.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-display font-bold text-text mb-4">intellectual property</h2>
                  <p className="leading-relaxed">
                    You retain all rights to the documents you upload. We claim no ownership over your contracts. However, the ContractChill branding, software, and website design are the exclusive property of ContractChill.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-display font-bold text-text mb-4">limitation of liability</h2>
                  <p className="leading-relaxed">
                    In no event will ContractChill be liable for any indirect, special, incidental, or consequential damages arising out of or related to your use of the service. We do not guarantee the accuracy or completeness of the AI-generated analysis.
                  </p>
                </section>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
