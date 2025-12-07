"use client";

import { useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useRouter } from "next/navigation";
import { LOGOUT, SEND_OTP, VERIFY_OTP, AUTH_TOKEN_KEY, USER_ID_KEY, UPDATE_PROFILE, USER_NAME, USER_EMAIL } from "../constants/Constant";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "react-toastify";
import { useProfileStore } from "../store/useProfileStore";
import { getGuestCart, getGuestWishlist, clearAllGuestData } from "@/utils/guestStorage";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const { setIsLoggedIn } = useProfileStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify" | "loggedin" | "updateProfile">("request");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
    if (value && !phoneRegex.test(value)) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
    } else {
      setPhoneError("");
    }
  };

  // Request OTP
  const handleRequestOtp = async () => {
    if (!phone || phoneError) {
      setMessage("Please enter a valid phone number");
      return;
    }
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
      // Get guest cart and wishlist from localStorage
      const guestCart = getGuestCart();
      const guestWishlist = getGuestWishlist();

      const requestBody: any = {
        phone: phone,
        otp: otp,
      };

      // Include guest data if available
      if (guestCart.length > 0) {
        requestBody.guestCart = guestCart;
      }
      if (guestWishlist.length > 0) {
        requestBody.guestWishlist = guestWishlist;
      }

      const res = await fetch(VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (res.ok) {
        secureLocalStorage.setItem(AUTH_TOKEN_KEY, data.token);
        localStorage.setItem(USER_ID_KEY, data.user.id);
        setUser(data.user);
        setIsLoggedIn(true);

        // Clear guest data from localStorage after successful sync
        clearAllGuestData();

        // Invalidate cart and wishlist queries to fetch merged data
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });

        // Show success message if guest data was synced
        if (guestCart.length > 0 || guestWishlist.length > 0) {
          toast.success("Your cart and wishlist have been synced!");
        }

        if (data.user.name === "User") {
          setStep("updateProfile");
        } else {
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
        body: JSON.stringify({ name: userName, email: email }),
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
        <button className="text-[12px] text-nowrap font-bold uppercase text-center">
          Sign In
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg p-6">
          <Dialog.Title className="text-[12px] font-semibold text-center text-black mb-4">
            Sign In
          </Dialog.Title>

          {step === "request" && (
            <div>
              <input
                type="tel"
                placeholder="+911234567890"
                value={phone}
                onChange={handlePhoneChange}
                className="input input-sm text-[12px] input-bordered w-full mb-1"
              />
              {phoneError && <p className="text-red-500 text-xs mb-2">{phoneError}</p>}
              <button
                className="btn bg-black text-white text-[12px] w-full"
                onClick={handleRequestOtp}
                disabled={!!phoneError || !phone}
              >
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
