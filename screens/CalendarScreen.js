import { StyleSheet, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { useState, useContext, useEffect } from 'react';
import { supabase } from '../supabase.js';
import { SessionContext } from '../Components/SessionContext';
import { set } from 'react-native-reanimated';

export default function CalendarScreen({ navigation }) {
    const { session, setSession } = useContext(SessionContext);

    const [selectedDays, setSelectedDays] = useState({
        selected: [],
        marked: {},
    });
    const [nextPeriod, setNextPerdiod] = useState([]);

    const readPeriods = async () => {
        const { data, error } = await supabase
            .from('periods')
            .select('period_day')
            .eq('user_id', session.user.id);

        console.log('error read = ', error);

        const periodDayLoad = data.map((e) => e.period_day);

        if (periodDayLoad.length > 1) {
            calculateNextPeriod();
            console.log('nextPeriodDay before marking =', nextPeriod);
            console.log('input markedperiod', [...periodDayLoad, ...nextPeriod]);
            setSelectedDays(() => {
                return {
                    selected: periodDayLoad,
                    marked: markedPeriod([...periodDayLoad, ...nextPeriod]),
                };
            });
        }
    };

    const calculateNextPeriod = () => {
        const firstCycleDay = new Date(selectedDays.selected[0]);
        console.log('firstCycleDay =', firstCycleDay);
        const nextPeriodDay = new Date(firstCycleDay.setDate(firstCycleDay.getDate() + 28));
        console.log('firstCycleDay = ', firstCycleDay, '  nextPeriodDay = ', typeof nextPeriodDay);
        const finalDay =
            nextPeriodDay.getFullYear().toString() +
            '-0' +
            (nextPeriodDay.getMonth() + 1).toString() +
            '-' +
            nextPeriodDay.getDate().toString();
        console.log('finalDay = ', finalDay);

        setNextPerdiod([finalDay]);
    };

    const postDay = async (day) => {
        const { data, error } = await supabase
            .from('periods')
            .insert([{ period_day: day, user_id: session.user.id }], { returning: 'minimal' });

        console.log('posts error =', error);
    };

    const deleteDay = async (day) => {
        const { data, error } = await supabase
            .from('periods')
            .delete()
            .eq('user_id', session.user.id)
            .eq('period_day', day);

        console.log('delete error = ', error);
    };

    const markedPeriod = (days) => {
        //cette fonction stylise les jours selectionnés en paramètre
        const markedDates = {};
        days.sort().map((day) => {
            if (day === days[0] && days.length > 1) {
                markedDates[day] = {
                    startingDay: true,
                    color: '#FF9A61',
                };
            } else if (day === days[days.length - 1] && days.length > 1) {
                markedDates[day] = {
                    selected: true,
                    endingDay: true,
                    color: '#FF9A61',
                };
            } else {
                markedDates[day] = {
                    selected: true,
                    color: '#FF9A61',
                };
            }
        });
        return markedDates;
    };

    const handleOnPressDay = async (value) => {
        const periodDay = value.dateString;
        if (selectedDays.selected.includes(periodDay)) {
            await deleteDay(periodDay);
            readPeriods();
        } else {
            await postDay(periodDay);
            readPeriods();
        }
    };

    useEffect(() => {
        readPeriods();
    }, []);

    return (
        <View style={styles.container}>
            <CalendarList
                pastScrollRange={6}
                futureScrollRange={3}
                scrollEnabled={true}
                style={{
                    borderWidth: 1,
                    borderColor: 'gray',
                    height: 350,
                }}
                theme={{
                    backgroundColor: '#FEF6D9',
                    calendarBackground: '#FEF6D9',
                }}
                onDayPress={(day) => handleOnPressDay(day)}
                markingType={'period'}
                markedDates={selectedDays.marked}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF6D9',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
