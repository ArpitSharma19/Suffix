import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { login, forgotPassword, verifyOtp, resetPassword } from '../../services/api';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [view, setView] = useState('login'); // 'login', 'forgot', 'otp', 'reset'
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetIdentifier, setResetIdentifier] = useState('');
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Backend verification first to get email and ensure Firebase user exists
            const { data } = await login(formData);
            const email = data.email;

            const userCredential = await signInWithEmailAndPassword(auth, email, formData.password);
            const token = await userCredential.user.getIdToken();

            localStorage.setItem('token', token);
            navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            // Prefer Firebase error message/code if available
            const fbMsg = err?.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : err?.message;
            const isNetwork = typeof err?.message === 'string' && err.message.toLowerCase().includes('network');
            const errorMsg = isNetwork
                ? 'Server unavailable. Please ensure the backend is running.'
                : (err.response?.data?.message || fbMsg || 'Invalid username or password');
            setMessage({ type: 'error', text: errorMsg });
            try { await auth.signOut(); } catch { /* ignore */ }
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await forgotPassword(resetIdentifier);
            setMessage({ type: 'success', text: 'OTP sent to your registered email.' });
            setView('otp');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send OTP' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await verifyOtp(resetIdentifier, otp);
            setView('reset');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid or expired OTP' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await resetPassword(resetIdentifier, otp, newPassword);
            setMessage({ type: 'success', text: 'Password reset successfully. You can now login.' });
            setView('login');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reset password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow-sm">
                            <div className="card-body">
                            {view === 'login' && (
                                <>
                                    <h3 className="card-title text-center mb-4">Admin Login</h3>
                                    {message.text && (
                                        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`} role="alert">
                                            {message.text}
                                        </div>
                                    )}
                                    <form onSubmit={handleLogin}>
                                        <div className="mb-3">
                                            <label className="form-label">Username</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter username"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="Enter password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                                            {loading ? 'Logging in...' : 'Login'}
                                        </button>
                                        <div className="text-center">
                                            <button type="button" className="btn btn-link p-0" onClick={() => { setView('forgot'); setMessage({type:'', text:''}); }}>
                                                Reset Password
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}

                            {view === 'forgot' && (
                                <>
                                    <h3 className="card-title text-center mb-4">Forgot Password</h3>
                                    {message.text && (
                                        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`} role="alert">
                                            {message.text}
                                        </div>
                                    )}
                                    <p className="text-muted text-center">Enter your username or email to receive an OTP.</p>
                                    <form onSubmit={handleSendOtp}>
                                        <div className="mb-3">
                                            <label className="form-label">Username or Email</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter username or email"
                                                value={resetIdentifier}
                                                onChange={(e) => setResetIdentifier(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                                            {loading ? 'Sending OTP...' : 'Send OTP'}
                                        </button>
                                        <div className="text-center">
                                            <button type="button" className="btn btn-link p-0" onClick={() => setView('login')}>
                                                Back to Login
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}

                            {view === 'otp' && (
                                <>
                                    <h3 className="card-title text-center mb-4">Verify OTP</h3>
                                    {message.text && (
                                        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`} role="alert">
                                            {message.text}
                                        </div>
                                    )}
                                    <form onSubmit={handleVerifyOtp}>
                                        <div className="mb-3">
                                            <label className="form-label">Enter 6-digit OTP</label>
                                            <input
                                                type="text"
                                                className="form-control text-center"
                                                placeholder="000000"
                                                maxLength="6"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                                            {loading ? 'Verifying...' : 'Verify OTP'}
                                        </button>
                                        <div className="text-center">
                                            <button type="button" className="btn btn-link p-0" onClick={() => setView('forgot')}>
                                                Resend OTP
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}

                            {view === 'reset' && (
                                <>
                                    <h3 className="card-title text-center mb-4">New Password</h3>
                                    {message.text && (
                                        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`} role="alert">
                                            {message.text}
                                        </div>
                                    )}
                                    <form onSubmit={handleResetPassword}>
                                        <div className="mb-3">
                                            <label className="form-label">Enter New Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="New password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </form>
                                </>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
