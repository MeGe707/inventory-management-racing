import React, { useState, useContext, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../Context/AppContext.jsx";

const COMPONENT_OPTIONS = [
  "ASIC",
  "Capacitor",
  "Diode",
  "Inductor",
  "Connector",
  "Resistor",
  "Transistor",
  "TVS Diode",
  "Schottky Diode",
  "Mosfet",
  "Zener Diode",
  "Crimp",
  "Relay",
  "Switch",
  "Microcontroller",
  "Cable",
  "OTHER",
];

const Label = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const TextInput = ({
  id,
  value,
  onChange,
  placeholder,
  required,
  error,
  ...props
}) => (
  <div className="space-y-1">
    <input
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full rounded-xl border px-3 py-2 outline-none transition
      focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
      ${error ? "border-red-400" : "border-gray-300"}`}
      {...props}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const NumberInput = (props) => (
  <TextInput {...props} inputMode="numeric" type="number" />
);

export default function AddItem() {
  const { link } = useContext(AppContext);

  const [form, setForm] = useState({
    name: "",
    component: "",
    brandName: "",
    supplierName: "",
    serialNumber: "",
    quantity: 1,
    threshold: 0,
    price: 0,
    location: "",
    isFrequentlyUsed: false,
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const requiredFields = useMemo(
    () => [
      "name",
      "component",
      "brandName",
      "supplierName",
      "serialNumber",
      "quantity",
      "location",
    ],
    []
  );

  const validate = () => {
    const e = {};
    requiredFields.forEach((k) => {
      if (
        form[k] === "" ||
        form[k] === null ||
        (typeof form[k] === "number" && Number.isNaN(form[k]))
      ) {
        e[k] = "This field is required.";
      }
    });

    if (Number(form.quantity) < 1) e.quantity = "Quantity must be at least 1.";
    if (Number(form.price) < 0) e.price = "Price cannot be less than 0.";
    if (!form.component) e.component = "This field is required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (key) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      [key]:
        key === "quantity" || key === "price"
          ? val === ""
            ? ""
            : Number(val)
          : val,
    }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const resetForm = () =>
    setForm({
      name: "",
      component: "",
      brandName: "",
      supplierName: "",
      serialNumber: "",
      quantity: 1,
      threshold: 0,
      price: 0,
      isFrequentlyUsed: false,
      location: "",
      description: "",
    });

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        component: form.component,
        brandName: form.brandName.trim(),
        supplierName: form.supplierName.trim(),
        serialNumber: form.serialNumber.trim(),
        quantity: Number(form.quantity),
        threshold: Number(form.threshold),
        price: Number(form.price),
        isFrequentlyUsed: form.isFrequentlyUsed,
        location: form.location.trim(),
        description: form.description.trim(),
      };

      const { data } = await axios.post(`${link}/user/add-item`, payload);

      if (data?.success) {
        toast.success(data.message || "Item added successfully.");
        resetForm();
      } else {
        toast.error(data?.message || "Item could not be added.");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "An error occurred while adding the item."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full max-w-5xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold">Add Item</p>
      </div>

      <div className="bg-white px-6 py-7 border rounded-2xl shadow-sm">
        {/* Section: Core info */}
        <div className="mb-6">
          <h3 className="mb-3 text-base font-semibold text-gray-800">
            Item Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="name" required>
                Item Name
              </Label>
              <TextInput
                id="name"
                value={form.name}
                onChange={onChange("name")}
                placeholder="e.g. STM32 Nucleo Board"
                required
                error={errors.name}
              />
            </div>

            <div>
              <Label htmlFor="component" required>
                Component
              </Label>

              <div className="relative">
                <select
                  id="component"
                  value={form.component}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, component: e.target.value }))
                  }
                  required
                  className={`w-full appearance-none rounded-xl border px-3 py-2 pr-9 outline-none transition
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        ${errors.component ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {COMPONENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {/* Chevron Icon */}
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.355a.75.75 0 111.02 1.1l-4.2 3.8a.75.75 0 01-1.02 0l-4.2-3.8a.75.75 0 01-.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {errors.component && (
                <p className="mt-1 text-xs text-red-600">{errors.component}</p>
              )}
            </div>

            <div>
              <Label htmlFor="brandName" required>
                Brand
              </Label>
              <TextInput
                id="brandName"
                value={form.brandName}
                onChange={onChange("brandName")}
                placeholder="e.g. STMicroelectronics"
                required
                error={errors.brandName}
              />
            </div>

            <div>
              <Label htmlFor="supplierName" required>
                Supplier
              </Label>
              <TextInput
                id="supplierName"
                value={form.supplierName}
                onChange={onChange("supplierName")}
                placeholder="e.g. Mouser / Digi-Key / Local Supplier"
                required
                error={errors.supplierName}
              />
            </div>

            <div>
              <Label htmlFor="serialNumber" required>
                Serial Number
              </Label>
              <TextInput
                id="serialNumber"
                value={form.serialNumber}
                onChange={onChange("serialNumber")}
                placeholder="e.g. SN-ABC123456"
                required
                error={errors.serialNumber}
              />
            </div>

            <div>
              <Label htmlFor="location" required>
                Location
              </Label>
              <TextInput
                id="location"
                value={form.location}
                onChange={onChange("location")}
                placeholder="e.g. Shelf A2 / Warehouse-1"
                required
                error={errors.location}
              />
            </div>
          </div>
        </div>

        {/* Section: Inventory & Price */}
        <div className="mb-6">
          <h3 className="mb-3 text-base font-semibold text-gray-800">
            Stock & Price
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="quantity" required>
                Quantity
              </Label>
              <NumberInput
                id="quantity"
                value={form.quantity}
                onChange={onChange("quantity")}
                placeholder="1"
                min={1}
                step={1}
                required
                error={errors.quantity}
              />
            </div>

            <div className="flex items-center mt-6">
              <input
                id="isFrequentlyUsed"
                type="checkbox"
                checked={form.isFrequentlyUsed}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isFrequentlyUsed: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="isFrequentlyUsed"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Frequently Used
              </label>
            </div>

            <div>
              <Label htmlFor="threshold" required>
                Threshold
              </Label>
              <NumberInput
                id="threshold"
                value={form.threshold}
                onChange={onChange("threshold")}
                placeholder="0"
                min={0}
                step={1}
                required
                error={errors.quantity}
              />
            </div>

            <div>
              <Label htmlFor="price">Price ($)</Label>
              <NumberInput
                id="price"
                value={form.price}
                onChange={onChange("price")}
                placeholder="0"
                min={0}
                step="0.01"
                error={errors.price}
              />
            </div>

            <div className="hidden md:block" />
          </div>
        </div>

        {/* Section: Description */}
        <div className="mb-2">
          <h3 className="mb-3 text-base font-semibold text-gray-800">
            Description
          </h3>
          <TextInput
            id="description"
            value={form.description}
            onChange={onChange("description")}
            placeholder="e.g. Rev-B board, with 3rd party connector..."
          />
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`rounded-xl px-5 py-2 text-white transition shadow
            ${
              submitting
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {submitting ? "Loading..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
