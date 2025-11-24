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
          <span className="label-text">Street</span>
        </label>
        <input
          type="text"
          name="street"
          className="input input-bordered"
          value={address.street}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">City</span>
        </label>
        <input
          type="text"
          name="city"
          className="input input-bordered"
          value={address.city}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">State</span>
        </label>
        <input
          type="text"
          name="state"
          className="input input-bordered"
          value={address.state}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Zip Code</span>
        </label>
        <input
          type="text"
          name="zip"
          className="input input-bordered"
          value={address.zip}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Country</span>
        </label>
        <input
          type="text"
          name="country"
          className="input input-bordered"
          value={address.country}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}