import { StyleSheet, Text, View } from 'react-native';
import Auth from '../Components/Auth.js';
import Account from '../Components/Account';
import { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase.js';
import { SessionContext } from '../App.js';

//A ScrollView component that handles keyboard appearance and automatically scrolls to focused TextInput
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CycleScreen from './CycleScreen.js';

export default function LoginScreen({ navigation }) {
    const { session, setSession } = useContext(SessionContext);

    return (
        <View>
            {session && session.user ? (
                <CycleScreen key={session.user.id} session={session} />
            ) : (
                <Auth />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});