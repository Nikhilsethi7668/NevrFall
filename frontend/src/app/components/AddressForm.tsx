"use client";

import { useState } from "react";

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface AddressFormProps {
  onSave: (address: Address) => void;
  onCancel: () => void;
}

export default function AddressForm({ onSave, onCancel }: AddressFormProps) {
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(address);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text text-[10px] text-gray-600">Street</span>
        </label>
        <input
          type="text"
          name="street"
          className="input input-bordered text-[10px] text-gray-600"
          value={address.street}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-[10px] text-gray-600">City</span>
        </label>
        <input
          type="text"
          name="city"
          className="input input-bordered text-[10px] text-gray-600"
          value={address.city}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-[10px] text-gray-600">State</span>
        </label>
        <input
          type="text"
          name="state"
          className="input input-bordered text-[10px] text-gray-600"
          value={address.state}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-[10px] text-gray-600">Zip Code</span>
        </label>
        <input
          type="text"
          name="zip"
          className="input input-bordered text-[10px] text-gray-600"
          value={address.zip}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-[10px] text-gray-600">Country</span>
        </label>
        <input
          type="text"
          name="country"
          className="input input-bordered text-[10px] text-gray-600"
          value={address.country}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn bg-black text-white text-[10px]">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline text-[10px] text-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}