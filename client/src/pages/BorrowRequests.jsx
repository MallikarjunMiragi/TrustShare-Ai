import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Returned: 'bg-slate-200 text-slate-700',
  Rejected: 'bg-rose-100 text-rose-700',
};

const statusIcons = {
  Pending: Clock,
  Approved: CheckCircle2,
  Returned: XCircle,
  Rejected: XCircle,
};

export default function BorrowRequests() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [ratingInputs, setRatingInputs] = useState({});
  const [ratingStatus, setRatingStatus] = useState({});

  const fetchRequests = async () => {
    try {
      const data = await api.get('/borrows', token);
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  const handleAction = async (requestId, action) => {
    setError('');
    try {
      await api.patch(`/borrows/${requestId}/${action}`, {}, token);
      fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRatingChange = (requestId, field, value) => {
    setRatingInputs((prev) => ({
      ...prev,
      [requestId]: { ...prev[requestId], [field]: value },
    }));
  };

  const submitRating = async (requestId) => {
    setRatingStatus((prev) => ({ ...prev, [requestId]: { loading: true } }));
    try {
      const payload = ratingInputs[requestId] || {};
      if (!payload.score) {
        setRatingStatus((prev) => ({
          ...prev,
          [requestId]: { loading: false, error: 'Score is required.' },
        }));
        return;
      }
      await api.post(
        '/ratings',
        { borrowRequestId: requestId, score: Number(payload.score), comment: payload.comment || '' },
        token
      );
      setRatingStatus((prev) => ({
        ...prev,
        [requestId]: { loading: false, success: 'Rating submitted!' },
      }));
    } catch (err) {
      setRatingStatus((prev) => ({
        ...prev,
        [requestId]: { loading: false, error: err.message },
      }));
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Borrow Requests</h2>
        <p className="text-sm text-slate-600">Track incoming and outgoing item requests.</p>
        {error ? <p className="mt-2 text-xs font-semibold text-rose-500">{error}</p> : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {requests.map((request) => {
          const statusLabelMap = {
            PENDING: 'Pending',
            ACTIVE: 'Approved',
            RETURNED: 'Returned',
            REJECTED: 'Rejected',
          };
          const statusLabel = statusLabelMap[request.status] || 'Pending';
          const Icon = statusIcons[statusLabel] || Clock;
          const isOwner = request.ownerId?._id === (user?.id || user?._id);
          const isBorrower = request.borrowerId?._id === (user?.id || user?._id);
          return (
            <GlassCard key={request._id || request.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {request.itemId?.title || request.item}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[statusLabel]
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Requested by {request.borrowerId?.name || request.from}
              </p>
              {request.message ? (
                <p className="text-xs text-slate-500">“{request.message}”</p>
              ) : null}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Icon className="h-4 w-4" />{' '}
                  {request.requestedAt ? new Date(request.requestedAt).toLocaleString() : 'Just now'}
                </div>
                {request.durationDays ? (
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">
                    {request.durationDays} days
                  </span>
                ) : null}
                <div className="flex gap-2">
                  {request.status === 'PENDING' && isOwner ? (
                    <>
                      <button
                        onClick={() => handleAction(request._id, 'approve')}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request._id, 'reject')}
                        className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700"
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                  {request.status === 'ACTIVE' && (isOwner || isBorrower) ? (
                    <button
                      onClick={() => handleAction(request._id, 'return')}
                      className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-white"
                    >
                      Mark Returned
                    </button>
                  ) : null}
                </div>
              </div>
              {request.status === 'RETURNED' && (isOwner || isBorrower) ? (
                <div className="rounded-2xl bg-white/70 p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">Leave a rating</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-[120px_1fr_auto]">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      placeholder="Score"
                      value={ratingInputs[request._id]?.score || ''}
                      onChange={(event) =>
                        handleRatingChange(request._id, 'score', event.target.value)
                      }
                      className="rounded-full bg-white px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Quick feedback"
                      value={ratingInputs[request._id]?.comment || ''}
                      onChange={(event) =>
                        handleRatingChange(request._id, 'comment', event.target.value)
                      }
                      className="rounded-full bg-white px-3 py-2 text-xs outline-none"
                    />
                    <button
                      onClick={() => submitRating(request._id)}
                      className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white"
                      disabled={ratingStatus[request._id]?.loading}
                    >
                      {ratingStatus[request._id]?.loading ? 'Saving...' : 'Submit'}
                    </button>
                  </div>
                  {ratingStatus[request._id]?.error ? (
                    <p className="mt-2 text-xs font-semibold text-rose-500">
                      {ratingStatus[request._id]?.error}
                    </p>
                  ) : null}
                  {ratingStatus[request._id]?.success ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-500">
                      {ratingStatus[request._id]?.success}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
