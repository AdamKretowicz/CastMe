import React, { useState } from "react";
import { sendEmail } from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendEmail(formData);
      setSuccess("Wiadomość została wysłana pomyślnie!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message || "Wystąpił błąd podczas wysyłania wiadomości.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen p-6 md:p-16 text-[#2b2628] font-sans">
      {/* Intro Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Fundacja Artystyczna GAMON wspiera rekrutację modeli i modelek
        </h1>
        <p className="text-lg md:text-xl text-[#333333] leading-relaxed">
          Promujemy lokalną kulturę i styl inspirowany tradycją lasowiacką. 
          Skontaktuj się z nami, aby zorganizować casting lub pozyskać uczestników 
          do pokazów mody, sesji fotograficznych i projektów artystycznych.
        </p>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto">
        <Card className="p-10 md:p-12 shadow-lg rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Skontaktuj się z nami
          </h2>

          {success && <p className="text-green-600 mb-4">{success}</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Imię i nazwisko</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Twoje imię i nazwisko"
                className="w-full border-b border-gray-300 py-2 px-1 text-[#2b2628] focus:outline-none focus:border-black"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Twój email"
                className="w-full border-b border-gray-300 py-2 px-1 text-[#2b2628] focus:outline-none focus:border-black"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Temat</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Temat wiadomości"
                className="w-full border-b border-gray-300 py-2 px-1 text-[#2b2628] focus:outline-none focus:border-black"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Wiadomość</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Twoja wiadomość"
                className="w-full border-b border-gray-300 py-2 px-1 text-[#2b2628] focus:outline-none focus:border-black resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full #d1185a text-white py-3 mt-4 font-semibold text-lg hover:#EA1A62 transition-colors"
            >
              {loading ? "Wysyłanie..." : "Wyślij wiadomość"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
