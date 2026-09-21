import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as authService from '../../services/authService'
import { signInWithGooglePopup } from '../../services/googleAuth'
import { getToken, setToken, clearToken } from '../../services/apiClient'

// Authenticated user state is genuinely complex, shared, and asynchronous
// (loading/error lifecycle, needed by Navbar, ProtectedRoute, Profile,
// Sidebar all at once) — exactly the case this project's own convention
// (established in Practical 3) puts in Redux rather than Context.
// ExamoraContext now holds only theme, which stays simple/local.

export const registerUser = createAsyncThunk('auth/register', async (form, { rejectWithValue }) => {
  try {
    return await authService.register(form)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const loginUser = createAsyncThunk('auth/login', async (form, { rejectWithValue }) => {
  try {
    return await authService.login(form)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
  try {
    const idToken = await signInWithGooglePopup()
    return await authService.googleAuth(idToken)
  } catch (err) {
    return rejectWithValue(err.message || 'Google sign-in failed')
  }
})

// Called on app load if a token is already in localStorage, so a page
// refresh doesn't lose the session (the token itself is what's
// persistent — this just confirms it's still valid and refetches the
// user it belongs to).
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const data = await authService.getMe()
    return data.user
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const data = await authService.updateMe(payload)
    return data.user
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const initialState = {
  user: null,
  isAuthenticated: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // If a token is already saved, we optimistically consider a session
  // "restoring" until fetchCurrentUser confirms/rejects it, so protected
  // routes don't flash a login redirect on every refresh.
  isRestoring: Boolean(getToken()),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      clearToken()
      state.user = null
      state.isAuthenticated = false
      state.status = 'idle'
      state.error = null
      state.isRestoring = false
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading'
      state.error = null
    }
    const rejected = (state, action) => {
      state.status = 'failed'
      state.error = action.payload || 'Something went wrong'
      state.isRestoring = false
    }
    const authSucceeded = (state, action) => {
      const { user, token } = action.payload
      setToken(token)
      state.user = user
      state.isAuthenticated = true
      state.status = 'succeeded'
      state.isRestoring = false
    }

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, authSucceeded)
      .addCase(registerUser.rejected, rejected)

      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, authSucceeded)
      .addCase(loginUser.rejected, rejected)

      .addCase(loginWithGoogle.pending, pending)
      .addCase(loginWithGoogle.fulfilled, authSucceeded)
      .addCase(loginWithGoogle.rejected, rejected)

      .addCase(fetchCurrentUser.pending, (state) => {
        state.isRestoring = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.isRestoring = false
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // Saved token is invalid/expired — treat as logged out.
        clearToken()
        state.user = null
        state.isAuthenticated = false
        state.isRestoring = false
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
