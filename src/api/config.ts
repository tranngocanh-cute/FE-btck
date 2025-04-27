import axios from 'axios';

const BASE_URL = 'http://localhost:3055/v1/api/';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable sending cookies in cross-origin requests
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;

interface QueueItem {
    resolve: (value: string) => void;
    reject: (error: Error) => void;
}

let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

// Function to check if the user is logged in and has valid tokens
export const checkAuth = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userInfo = localStorage.getItem('userInfo');
    return !!(accessToken && refreshToken && userInfo);
};

// Function to refresh token manually
export const refreshAccessToken = async (): Promise<boolean> => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
        
        if (!refreshToken || !userId || !accessToken) {
            console.log('[Auth Manual] Missing tokens or userId');
            return false;
        }
        
        console.log('[Auth Manual] Making manual refresh token request');
        const response = await axios.post(`${BASE_URL}shop/refreshToken`, {
            refreshToken: refreshToken
        }, {
            headers: {
                'x-client-id': userId,
                'Content-Type': 'application/json',
                'Authorization': accessToken
            }
        });
        
        console.log('[Auth Manual] Refresh token response:', response.data);
        
        if (response.data?.metadata?.tokens) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.metadata.tokens;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            console.log('[Auth Manual] Updated tokens successfully');
            return true;
        } else if (response.data?.metadata?.token) {
            // Alternative response structure
            const { token, refreshToken: newRefreshToken } = response.data.metadata;
            
            localStorage.setItem('accessToken', token.accessToken || token);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }
            
            console.log('[Auth Manual] Updated tokens using alternative structure');
            return true;
        }
        
        console.log('[Auth Manual] No tokens in response');
        return false;
    } catch (error) {
        console.error('[Auth Manual] Token refresh failed:', error);
        return false;
    }
};

// Add a request interceptor to add the token to all requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Send only the token without 'Bearer ' prefix
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // If error is unauthorized and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If we're already refreshing the token, add this request to the queue
                return new Promise<string>(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = token;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            // Try to refresh the token
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const accessToken = localStorage.getItem('accessToken');
                const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userInfo') || '{}')._id;
                
                console.log('[Auth Debug] Attempting to refresh token', { userId, hasRefreshToken: !!refreshToken, hasAccessToken: !!accessToken });
                
                if (!refreshToken || !userId || !accessToken) {
                    console.log('[Auth Debug] Missing refresh token, access token or userId', { refreshToken, userId, accessToken });
                    // If no refresh token or user ID, redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userInfo');
                    localStorage.removeItem('userId');
                    window.location.href = '/signin';
                    return Promise.reject(error);
                }
                
                console.log('[Auth Debug] Calling refresh token API');
                const response = await axios.post(`${BASE_URL}shop/refreshToken`, {
                    refreshToken: refreshToken
                }, {
                    headers: {
                        'x-client-id': userId,
                        'Content-Type': 'application/json',
                        'Authorization': accessToken
                    }
                });
                
                console.log('[Auth Debug] Refresh token response:', response.data);
                
                let newAccessToken = null;
                let newRefreshToken = null;
                
                // Handle different response structures
                if (response.data?.metadata?.tokens) {
                    const tokens = response.data.metadata.tokens;
                    newAccessToken = tokens.accessToken;
                    newRefreshToken = tokens.refreshToken;
                } else if (response.data?.metadata?.token) {
                    // Alternative structure
                    const token = response.data.metadata.token;
                    newAccessToken = token.accessToken || token;
                    newRefreshToken = response.data.metadata.refreshToken;
                }
                
                if (newAccessToken) {
                    console.log('[Auth Debug] Got new tokens', { 
                        hasAccessToken: !!newAccessToken, 
                        hasRefreshToken: !!newRefreshToken 
                    });
                    
                    localStorage.setItem('accessToken', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }
                    
                    // Update the original request with the new token
                    originalRequest.headers['Authorization'] = newAccessToken;
                    
                    // Process the queue with the new token
                    processQueue(null, newAccessToken);
                    
                    return apiClient(originalRequest);
                } else {
                    console.log('[Auth Debug] No tokens in response metadata', response.data);
                    throw new Error('No tokens in response');
                }
            } catch (refreshError) {
                // If refresh failed, clear all auth data and redirect to login
                console.error('[Auth Debug] Refresh token error:', refreshError);
                processQueue(refreshError instanceof Error ? refreshError : new Error('Refresh token failed'), null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('userId');
                window.location.href = '/signin';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
); 