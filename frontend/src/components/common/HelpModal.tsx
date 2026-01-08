import { useI18n } from '../../i18n';
import MaterialIcon from './MaterialIcon';
import ru from '../../i18n/locales/ru.json';
import en from '../../i18n/locales/en.json';
import az from '../../i18n/locales/az.json';

export type HelpType = 'addOperation' | 'budget' | 'analytics' | 'categories' | 'export' | 'filters';

interface HelpModalProps {
  helpType: HelpType;
  isOpen: boolean;
  onClose: () => void;
}

const translations: Record<string, any> = {
  ru,
  az,
  en,
};

export default function HelpModal({ helpType, isOpen, onClose }: HelpModalProps) {
  const { t, language } = useI18n();

  if (!isOpen) return null;

  const dict = translations[language] || translations.ru;
  
  // Получаем данные из плоской структуры JSON
  const title = dict[`help.${helpType}.title`] || '';
  const description = dict[`help.${helpType}.description`] || '';
  const steps = (dict[`help.${helpType}.steps`] as string[]) || [];
  const tips = (dict[`help.${helpType}.tips`] as string[]) || [];

  return (
    <div 
      className="fixed inset-0 bg-[#120c08]/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative top-10 mx-auto w-[92vw] max-w-lg p-6 sm:p-7 border shadow-xl rounded-3xl bg-white dark:bg-[#1a1a1a]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#d4d4d8] dark:hover:bg-[#252525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30]"
          aria-label={t('common.close')}
          title={t('common.close')}
        >
          <MaterialIcon name="close" className="h-7 w-7" />
        </button>
        
        <div className="space-y-6 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d27b30]/10 text-[#d27b30]">
              <MaterialIcon name="help" className="h-5 w-5" variant="outlined" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">
              {title}
            </h3>
          </div>

          {description && (
            <p className="text-base text-gray-700 dark:text-[#d4d4d8]">
              {description}
            </p>
          )}

          {steps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-[#e5e7eb] mb-3">
                {t('help.stepsTitle')}
              </h4>
              <ol className="space-y-2 list-decimal list-inside text-base text-gray-700 dark:text-[#d4d4d8]">
                {steps.map((step: string, index: number) => (
                  <li key={index} className="pl-2">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tips.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-[#e5e7eb] mb-3">
                {t('help.tipsTitle')}
              </h4>
              <ul className="space-y-2 list-disc list-inside text-base text-gray-700 dark:text-[#d4d4d8]">
                {tips.map((tip: string, index: number) => (
                  <li key={index} className="pl-2">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

