import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

const AuthProvider = ({children}) => {
    const [authData, setAuthData] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const authData = await AsyncStorage.getItem('@AuthData');
            if (authData) {
                setAuthData(JSON.parse(authData));
            }
        } finally {
            setLoading(false);
        }
    }

    const setAuth = async (user) => {
        if (!user) throw new Error('useAuth must be used within an AuthProvider');
        setAuthData(user);
        AsyncStorage.setItem('@AuthData', JSON.stringify(user));
    };

    const signOut = () => {
        setAuthData(undefined);
        AsyncStorage.removeItem('@AuthData');
    };

    return (
        <AuthContext.Provider value={{authData, loading, setAuth, signOut}}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export {AuthContext, AuthProvider, useAuth};
