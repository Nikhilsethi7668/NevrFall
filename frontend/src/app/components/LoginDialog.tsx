"use client";

import { useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useRouter } from "next/navigation";
import { LOGOUT, SEND_OTP, VERIFY_OTP, AUTH_TOKEN_KEY, USER_ID_KEY, UPDATE_PROFILE, USER_NAME, USER_EMAIL } from "../constants/Constant";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "react-toastify";
import { useProfileStore } from "../store/useProfileStore";

export default function LoginDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const {setIsLoggedIn} = useProfileStore();
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify" | "loggedin" | "updateProfile">("request");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  // Request OTP
  const handleRequestOtp = async () => {
    if (!phone) return setMessage("Please enter phone number");
    setLoading(true);
    setMessage("");
    const URL = SEND_OTP;
    try {
      const res = await fetch(SEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP sent successfully ");
        setStep("verify");
      } else {
        setMessage(data.error || "Failed to send OTP");
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setMessage("Server error, try again later");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return setMessage("Please enter OTP");

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phone, otp: otp }),
      });
      const data = await res.json();
      if (res.ok) {
        secureLocalStorage.setItem(AUTH_TOKEN_KEY, data.token);
        localStorage.setItem(USER_ID_KEY, data.user.id);
        setUser(data.user);
        setIsLoggedIn(true);
        if(data.user.name === "User"){
          setStep("updateProfile");
        }else{
          localStorage.setItem(USER_NAME, data.user.name);
          localStorage.setItem(USER_EMAIL, data.user.email);
          setStep("loggedin");
          setTimeout(() => {
          setOpen(false);
          window.location.reload();
        }, 1500);
        }
      } else {
        setMessage(data.error || "Invalid OTP");
        toast.error(data.error || "Invalid OTP");
      }
    } catch (err) {
      setMessage("Server error, try again later");
    } finally {
      setLoading(false);
    }
  };
  console.log(user);

  const updateProfile = async () => {
    if (!userName) return setMessage("Please enter name");
    setLoading(true);
    const URL = UPDATE_PROFILE;
    try {
      const res = await fetch(URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secureLocalStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({ name: userName, email: email}),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, name: userName });
        setStep("loggedin");
        localStorage.setItem(USER_NAME, userName);
        toast.success("Profile updated successfully");
        setTimeout(() => {
          setOpen(false);
          window.location.reload();
        }, 1500);
      } else {
        setMessage(data.error || "Failed to update profile");
        toast.error(data.error || "Failed to update profile");
      }
    }
    catch (err) {
      setMessage("Server error, try again later");
    }
    finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch(LOGOUT, {
      method: "POST",
      credentials: "include",
    });
    secureLocalStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    setUser(null);
    setStep("request");
    setOtp("");
    setPhone("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button>
          <svg width="25" height="25" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg" id="svgkp">
            <path d="M22.9129 12.935L13.7571 23.0474C13.5348 23.2929 13.1284 23.1084 13.1669 22.7794L14.0816 14.9731H10.6991C10.4034 14.9731 10.2484 14.6219 10.4478 14.4035L20.3133 3.59739C20.5589 3.32834 20.9984 3.58134 20.8891 3.92887L18.2354 12.3664H22.6607C22.9557 12.3664 23.1109 12.7163 22.9129 12.935Z" fill="#FEA203"></path>
            <path id="svgkp-path" fillRule="evenodd" clipRule="evenodd" d="M16.6079 5.35819C16.4805 5.1933 16.3421 5.03582 16.1932 4.8869C15.2702 3.96387 14.0183 3.44531 12.7129 3.44531C11.4075 3.44531 10.1556 3.96387 9.2326 4.8869C8.30957 5.80993 7.79102 7.06183 7.79102 8.36719C7.79102 9.67255 8.30957 10.9244 9.2326 11.8475C9.48368 12.0986 9.75909 12.3197 10.0533 12.5086L11.0235 11.4503C10.7335 11.2914 10.4649 11.0911 10.227 10.8531C9.56766 10.1938 9.19727 9.29959 9.19727 8.36719C9.19727 7.43479 9.56766 6.54057 10.227 5.88127C10.8863 5.22196 11.7805 4.85156 12.7129 4.85156C13.6453 4.85156 14.5395 5.22196 15.1988 5.88127C15.3636 6.04604 15.5103 6.22549 15.6377 6.41654L16.6079 5.35819ZM20.6413 18.6497L19.6746 19.7132C20.1676 20.4122 20.4473 21.2264 20.4473 22.0781V23.8359C20.4473 24.2243 20.7621 24.5391 21.1504 24.5391C21.5387 24.5391 21.8535 24.2243 21.8535 23.8359V22.0781C21.8535 20.7863 21.4016 19.6103 20.6413 18.6497ZM12.3111 17.5078H10.3026C7.27113 17.5078 4.97852 19.6394 4.97852 22.0781V23.8359C4.97852 24.2243 4.66372 24.5391 4.27539 24.5391C3.88707 24.5391 3.57227 24.2243 3.57227 23.8359V22.0781C3.57227 18.6922 6.67684 16.1016 10.3026 16.1016H12.4885L12.3111 17.5078Z" fill="currentColor" stroke="currentColor"></path>
          </svg>
      </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg p-6">
          <Dialog.Title className="text-[12px] font-semibold text-center text-secondary mb-4">
            Sign In
          </Dialog.Title>

          {step === "request" && (
            <div>
              <input
                type="tel"
                placeholder="+911234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input input-bordered w-full mb-3"
              />
              <button className="btn btn-primary w-full" onClick={handleRequestOtp}>
                Request OTP
              </button>
            </div>
          )}

          {step === "verify" && (
            <div>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input input-bordered w-full mb-3"
              />
              <button className="btn btn-success w-full" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
            </div>
          )}

          {step === "loggedin" && (
            <div className="text-center">
              <p className="text-gray-700 mb-4">You’re logged in !</p>
              <button
                className="btn btn-error w-full"
                onClick={() => setOpen(false)}
              >
                Continue
              </button>
            </div>
          )}

          {step === "updateProfile" && (
            <div className="text-center">
              <p className="text-gray-700 mb-4">Update Profile</p>
              <input
                type="text"
                placeholder="Enter Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input input-bordered w-full mb-3"
              />
              <input
                type="text"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full mb-3"
              />
              <button
                className="btn btn-error w-full"
                onClick={() => updateProfile()}
              >
                Update Profile
              </button>
            </div>
          )}

          <Dialog.Close asChild>
            <button className="btn btn-sm btn-circle absolute right-3 top-3">✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}