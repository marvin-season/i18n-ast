import { Demo } from './demo/Demo.tsx';
import i18n, { t } from 'i18next';
import { Already_i18n } from './already_i18n';

const languages = ['en', 'zh'];

function App() {
  return (
    <>
      <select
        defaultValue={i18n.resolvedLanguage}
        onChange={async (evt) => {
          await i18n.changeLanguage(evt.target.value);
          window.location.reload();
        }}
      >
        {languages.map((lng) => (
          <option
            key={lng}
            value={lng}
            label={lng}
            style={{
              fontWeight: i18n.resolvedLanguage === lng ? 'bolder' : 'normal',
            }}
          />
        ))}
      </select>
      {t('common.api.success')}
    </>
  );
}

export default App;
