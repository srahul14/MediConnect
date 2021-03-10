import React from 'react';
import {Component} from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import axios from 'axios';
import {ScrollView} from 'react-native-gesture-handler';
import {Calendar} from 'react-native-calendars';

class DoctorAppointments extends Component {
	constructor(props) {
		super(props);
		this.state = {
			serverData: [],
			appointmentsArray: [{id: '', createdAt: '', doctorId: '', end_time: ''}],
			appointmentDates: [null],
			no_appointments: true,
		};
	}

	componentDidMount = () => {
		const uid = global.userID;

		axios
			// .get("http://10.0.2.2:5000/doctor/appointment/" + uid,
			.get(
				'http://54.176.99.202:5000/doctor/appointment/' + uid,
				{},
				{
					headers: {
						//Accept: "application/json",
						//"Content-Type": "application/json",
						Cookie: global.jwt,
					},
				},
			)

			.then((res) => {
				console.log(res.data);
				this.setState({
					serverData: Object.keys(res.data),
					no_appointments: res.data.appointments.length > 0 ? false : true,
					appointmentsArray: this.state.no_appointments
						? []
						: Object.values(res.data.appointments),
				});

				// console.log(res.data.appointments)
				console.log('no app' + this.state.no_appointments);

				var dates = [];

				if (this.state.no_appointments === false) {
					this.setState({
						appointmentsArray: Object.values(res.data.appointments),
					});
					for (
						var i = 0;
						i < Object.values(this.state.appointmentsArray).length;
						i++
					) {
						dates[i] = Object.values(this.state.appointmentsArray)[
							i
						].start_time.substring(0, 10);
					}
					var obj = dates.reduce(
						(c, v) => Object.assign(c, {[v]: {selected: true}}),
						{},
					);
					this.setState({appointmentDates: obj});

					console.log('app array' + this.state.appointmentDates);
				}
			})
			.catch((err) => console.log(err));
		//}).catch((err) => console.log(err));
	};

	notif = () => {
		LocalNotification();
	};

	render() {
		let appointments;

		// console.log("app is " + Object.values(this.state.appointmentsArray))

		if (
			this.state.no_appointments === false &&
			this.state.appointmentsArray.length > 0
		) {
			appointments = (
				<View>
					{Object.values(this.state.appointmentsArray).map((item, count) => (
						<View style={styles.patient} key={count}>
							<TouchableOpacity
								style={styles.patientinfo}
								onPress={() => {
									this.props.navigation.navigate('AppointmentDetails', {
										id: item.patientId,
										type: 0,
									});
								}}
							>
								<Text style={styles.appointmentHeader}>
									{'Appointment ' + (count + 1)}
								</Text>
								<Text>{'Date: ' + item.start_time.substring(0, 10)}</Text>
								<Text>
									{'Start Time: ' + item.start_time.substring(11, 19)}
								</Text>
								<Text>{'End Time: ' + item.end_time.substring(11, 19)}</Text>
								<View style={styles.buttonContainer}>
									<TouchableOpacity
										style={styles.button}
										onPress={() => {
											this.props.navigation.navigate('AppointmentDetails', {
												id: item.patientId,
												type: 0,
											});
										}}
									>
										<Text style={styles.buttonText}>View Patient Details</Text>
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
						</View>
					))}
				</View>
			);
		} else {
			appointments = (
				<View style={styles.noAppsContainer}>
					<Text style={styles.noApps}>You have no appointments</Text>
				</View>
			);
		}

		return (
			<ScrollView style={styles.big}>
				<View style={styles.container}>
					<View style={styles.appointmentsContainer}>
						<Calendar
							// onDayPress={this.onDayPress}
							testID="Appointments_Page_Calendar"
							style={styles.calendar}
							hideExtraDays
							markedDates={this.state.appointmentDates}
							theme={{
								selectedDayBackgroundColor: '#02d9b5',
								todayTextColor: '#02d9b5',
								arrowColor: '#02d9b5',
							}}
						/>
					</View>
					{/* <Text style={styles.header}>Appointments</Text> */}
					{appointments}
				</View>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	big: {
		width: '100%',
		height: '100%',
		backgroundColor: 'white',
	},

	container: {
		flex: 1,
		backgroundColor: 'white',
		fontFamily: 'Iowan Old Style',
		width: '100%',
		height: '100%',
		padding: 10,
	},

	header: {
		color: '#02f0c8',
		fontSize: 20,
		padding: 20,
	},

	body: {
		color: 'black',
		fontSize: 15,
	},

	icon: {
		width: 50,
		justifyContent: 'center',
	},

	option: {
		padding: 20,
		borderColor: '#02f0c8',
		borderRadius: 7,
		backgroundColor: '#d9d9d9',
		alignItems: 'center',
		margin: 10,
		flexDirection: 'row',
	},

	optionText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 16,
		color: 'black',
	},

	headerText: {
		//textAlign: 'center',
		fontWeight: 'bold',
		//fontStyle: 'italic',
		fontSize: 20,
		fontFamily: 'Iowan Old Style',
		//fontSize: 20,
		color: 'black',
		//padding:20
	},

	containerBox: {
		alignSelf: 'center',
		backgroundColor: '#02f0c8',
		borderRadius: 10,
		shadowColor: 'black',
		shadowOpacity: 1,
		shadowRadius: 4.65,
		elevation: 8,
		width: 270,
		padding: 5,
	},

	text: {
		color: '#5c5c5c',
		fontSize: 15,
	},

	button: {
		backgroundColor: '#02f0c8',
		padding: 5,
		margin: 10,
		height: 30,
		width: 150,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: 'black',
		borderRadius: 7,
	},

	buttonText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 15,
		color: '#5c5c5c',
	},

	buttonContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},

	patient: {
		backgroundColor: '#d9d9d9',
		// height: 120,
		width: 270,
		margin: 15,
		borderRadius: 5,
		shadowColor: 'black',
		shadowOpacity: 1,
		shadowRadius: 4.65,
		elevation: 8,
		padding: 15,
		alignSelf: 'center',
	},

	patientinfo: {
		fontFamily: 'Iowan Old Style',
		color: 'black',
		fontSize: 11,
	},

	appointmentHeader: {
		fontFamily: 'Iowan Old Style',
		color: 'black',
		fontSize: 15,
		textDecorationLine: 'underline',
	},

	calendar: {
		borderTopWidth: 1,
		paddingTop: 5,
		borderBottomWidth: 1,
		borderColor: '#eee',
		height: 350,
	},

	appointmentsContainer: {
		marginTop: 20,
	},

	noApps: {
		fontFamily: 'Iowan Old Style',
		fontSize: 20,
		color: '#5c5c5c',
	},

	noAppsContainer: {
		marginTop: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default DoctorAppointments;
