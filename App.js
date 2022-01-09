import {AuthProvider} from "./src/contexts/Auth";
import {Router} from "./src/Router";
import * as eva from '@eva-design/eva';
import {ApplicationProvider} from '@ui-kitten/components';
import {default as theme} from './assets/custom-theme.json';
import 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {persistor, store} from './src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';
import { LogBox } from 'react-native';

export default function App() {
    LogBox.ignoreAllLogs(true);
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <AuthProvider>
                    <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>
                        <Router/>
                    </ApplicationProvider>
                </AuthProvider>
            </PersistGate>
        </Provider>
    );
}
