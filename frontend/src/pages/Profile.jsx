import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Pencil, Check, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import { logout, updateProfile } from '../redux/slices/authSlice'
import { studentSidebarLinks, adminSidebarLinks } from '../data/sidebarLinks'

export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [profileImage, setProfileImage] = useState(user?.profileImage || '')
  const [isSaving, setIsSaving] = useState(false)

  const sidebarLinks = user?.role === 'admin' || user?.role === 'teacher' ? adminSidebarLinks : studentSidebarLinks

  if (!user) return null

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const handleSave = async () => {
    setIsSaving(true)
    const result = await dispatch(updateProfile({ name, profileImage }))
    setIsSaving(false)
    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setName(user.name)
    setProfileImage(user.profileImage || '')
    setIsEditing(false)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar links={sidebarLinks} footerLabel={`Signed in as ${user.role[0].toUpperCase() + user.role.slice(1)}`} />

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-10">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">My Profile</h1>

          <div className="mt-7 rounded-3xl border border-line bg-paper-raised p-6 sm:p-9">
            <div className="flex flex-col items-center text-center">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  className="h-24 w-24 rounded-full border border-line object-cover"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full bg-teal-soft text-teal">
                  <User size={36} aria-hidden="true" />
                </div>
              )}

              {isEditing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus-ring mt-4 w-full max-w-xs rounded-xl border border-line bg-paper px-3.5 py-2 text-center font-display text-lg font-semibold text-ink"
                />
              ) : (
                <h2 className="mt-4 font-display text-xl font-semibold text-ink">{user.name}</h2>
              )}
            </div>

            {isEditing && (
              <div className="mt-4">
                <label htmlFor="profileImage" className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Profile photo URL
                </label>
                <input
                  id="profileImage"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://…"
                  className="focus-ring w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-muted"
                />
              </div>
            )}

            <dl className="mt-7 divide-y divide-line border-y border-line">
              <div className="flex items-center justify-between py-3.5">
                <dt className="text-sm text-muted">Email</dt>
                <dd className="text-sm font-medium text-ink">{user.email}</dd>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <dt className="text-sm text-muted">Role</dt>
                <dd className="text-sm font-medium capitalize text-ink">{user.role}</dd>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <dt className="text-sm text-muted">Member Since</dt>
                <dd className="text-sm font-medium text-ink">{memberSince}</dd>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <dt className="text-sm text-muted">Authentication</dt>
                <dd className="text-sm font-medium text-ink">
                  {user.provider === 'google' ? 'Google Account' : 'Email'}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              {isEditing ? (
                <>
                  <Button variant="primary" onClick={handleSave} disabled={isSaving} className="flex-1">
                    <Check size={16} aria-hidden="true" /> {isSaving ? 'Saving…' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1">
                    <X size={16} aria-hidden="true" /> Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="flex-1">
                  <Pencil size={16} aria-hidden="true" /> Edit Profile
                </Button>
              )}
            </div>

            <div className="mt-3 border-t border-line pt-5">
              <Button variant="ghost" onClick={handleLogout} className="w-full text-coral hover:bg-coral-soft">
                <LogOut size={16} aria-hidden="true" /> Logout
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
