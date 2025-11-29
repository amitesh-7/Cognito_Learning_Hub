import { GoogleLogin } from "@react-oauth/google";

const GoogleAuthButton = ({
  onSuccess,
  onError,
  text = "Continue with Google",
}) => {
  const handleSuccess = (credentialResponse) => {
    console.log("Google OAuth successful");
    onSuccess(credentialResponse);
  };

  const handleError = () => {
    console.error("Google OAuth failed");
    onError();
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={text}
        theme="outline"
        size="large"
        className="w-full"
        use_fedcm_for_prompt={true}
        ux_mode="popup"
        context="use"
      />
    </div>
  );
};

export default GoogleAuthButton;
