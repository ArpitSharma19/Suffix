import React, { useEffect, useMemo, useState } from "react";
import { getContentByKey, postEnquiry } from "../services/api";
import emailjs from "@emailjs/browser";

const ContactSection = ({ override }) => {
    const [content, setContent] = useState({
        heading: "Contact us",
        description: "",
        offices: [
            { label: "Corporate Office", address: "" },
            { label: "Registered Office", address: "" },
        ],
        phone: "",
        email: "",
        emailjs: { serviceId: "", templateId: "", publicKey: "" }
    });
    const [form, setForm] = useState({ name: "", mobile: "", email: "", message: "" });
    const [status, setStatus] = useState({ type: "", text: "" });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getContentByKey("contact");
                if (res.data && res.data.value) setContent(res.data.value);
            } catch {
                /* defaults */
            }
        };
        load();
    }, []);

    const cfg = useMemo(() => override?.emailjs || content.emailjs || {}, [override, content]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "", text: "" });
        try {
            const res = await postEnquiry(form);
            if (res.status >= 200 && res.status < 300) {
                const serviceId = cfg.serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID;
                const templateId = cfg.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
                const publicKey = cfg.publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
                if (serviceId && templateId && publicKey) {
                    await emailjs.send(serviceId, templateId, {
                        from_name: form.name,
                        from_email: form.email,
                        from_mobile: form.mobile,
                        message: form.message,
                        to_email: override?.toEmail || content.email || "",
                    }, { publicKey });
                }
                setStatus({ type: "success", text: "Thanks! Your message has been sent." });
                setForm({ name: "", mobile: "", email: "", message: "" });
            } else {
                setStatus({ type: "error", text: "Saving enquiry failed." });
            }
        } catch {
            setStatus({ type: "error", text: "Could not save enquiry." });
        }
    };

    return (
        <section id="contact" className="py-5">
            <div className="container">
                <div className="mb-4 text-center">
                    <h2 className="fs-40 fw-medium">{override?.heading || content.heading}</h2>
                    {(override?.description || content.description) && (
                        <p className="fs-20">{override?.description || content.description}</p>
                    )}
                </div>
                <div className="row g-4">
                    <div className="col-md-5">
                        <h4>{override?.contactInfoTitle || "Contact Information"}</h4>
                        <ul className="list-unstyled">
                            {(override?.offices || content.offices || []).map((o, i) => (
                                <li key={i} className="mb-4">
                                    <div className="fw-semibold">{o.label}</div>
                                    <div className="text-muted">{o.address}</div>
                                </li>
                            ))}
                        </ul>
                        {(override?.phone || content.phone) && (
                            <div className="mb-3">
                                <div className="fw-semibold">Phone</div>
                                <div className="text-muted">{override?.phone || content.phone}</div>
                            </div>
                        )}
                        {(override?.email || content.email) && (
                            <div>
                                <div className="fw-semibold">Mail</div>
                                <div className="text-muted">{override?.email || content.email}</div>
                            </div>
                        )}
                    </div>
                    <div className="col-md-7">
                        <h4>{override?.getInTouchTitle || "Get in touch with us"}</h4>
                        {status.text && (
                            <div className={`alert ${status.type === "success" ? "alert-success" : "alert-danger"}`}>
                                {status.text}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-6">
                                <input className="form-control" placeholder="Name*" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required />
                            </div>
                            <div className="col-md-6">
                                <input className="form-control" placeholder="Mobile No." value={form.mobile} onChange={(e)=>setForm({...form, mobile: e.target.value})} />
                            </div>
                            <div className="col-12">
                                <input type="email" className="form-control" placeholder="Email Id*" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required />
                            </div>
                            <div className="col-12">
                                <textarea className="form-control" placeholder="Enter your Message here..." rows="6" value={form.message} onChange={(e)=>setForm({...form, message: e.target.value})} />
                            </div>
                            <div className="col-12">
                                <button className="btn btn-primary">Send Message</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
