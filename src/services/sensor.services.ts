
import { collection, Timestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

type SensorDataPayload = {
    temperature: number;
    humidity: number;
    ammoniaLevel: number;
};

export function addSensorData(firestore: Firestore, userId: string, data: SensorDataPayload) {
    const sensorDataRef = collection(firestore, 'users', userId, 'sensorData');
    const newSensorReading = {
      ...data,
      timestamp: Timestamp.now(),
    };
    addDocumentNonBlocking(sensorDataRef, newSensorReading);
}
