import AccountSettings from '../profile/components/AccountSettings';

const Settings = () => {
  return (
    <div className="container-fluid py-4">
      <AccountSettings initialTab="security" />
    </div>
  );
};

export default Settings;
