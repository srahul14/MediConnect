import React from 'react';
import {Component} from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import axios from 'axios';
import {ScrollView} from 'react-native-gesture-handler';

class Doctors extends Component {
	constructor(props) {
		super(props);
	}

	state = {
		// serverData: [ {users: []}],
		specs: [],
		specs_data: [{spec0: [], spec1: [], spec2: []}],
		screenHeight: 0,
	};

	onContentSizeChange = (contentWidth, contentHeight) => {
		// Save the content height in state
		this.setState({screenHeight: contentHeight});
	};

	componentDidMount = () => {
		console.log(this.props.route.params.symptoms);

		axios
			.post('http://54.176.99.202:5000/patient/search', {
				// .post('http://10.0.2.2:5000/patient/search', {
				// params: {
				symptoms: [this.props.route.params.symptoms],
				// },
			})
			.then((res) => {
				console.log(res.data);
				this.setState({
					specs: Object.keys(res.data),
					specs_data: Object.values(res.data),
				});
			})
			.catch((err) => {
				console.log(err.response);
			});
	};

	async selectDoctor(text) {
		console.log(text);
		global.selectedDoctorID = text;

		this.props.navigation.navigate('CreateAppointment', {selectedID: text});
		// })
		// .catch((err) => {
		// 	console.log(err.response.data);
		// });
	}

	render() {
		// const { serverData } = this.state;

		// console.log(this.state.specs);

		return (
			<ScrollView style={styles.scrollView}>
				<View style={styles.container}>
					<Text style={styles.header}>Doctors Found</Text>
					<Text style={styles.select}>Select a doctor:</Text>
					<View>
						{this.state.specs.map((spec, count) => (
							<View key={count}>
								<Text style={styles.spec}>
									Specialization {count + 1} : {spec}
								</Text>
								{this.state.specs_data[count].map((value, index) => (
									<TouchableOpacity
										style={styles.doctor}
										key={value.password}
										onPress={() => this.selectDoctor(value._id)}
									>
										<Text style={styles.doctorinfo}>
											{'Doctor Name: ' +
												// value.undefined[0].first_name +
												value.first_name +
												' ' +
												value.last_name}
										</Text>
										<Text style={styles.doctorinfo}>
											{'Specialisation: ' + value.specialization}
										</Text>
										<Text style={styles.doctorinfo}>
											{'Doctor Email: ' + value.email}
										</Text>
										<Text style={styles.doctorinfo}>
											{'Doctor Rating: ' + value.rating}
										</Text>
										<Text style={styles.doctorinfo}>
											{'Verified: ' + value.verified}
										</Text>
										<Text style={styles.doctorinfo}>
											{'Years of Experience: ' + value.years_of_experience}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						))}
					</View>
				</View>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	select: {
		marginTop: 20,
		fontSize: 17,
		fontFamily: 'Iowan Old Style',
		color: '#5c5c5c',
		textDecorationLine: 'underline',
	},

	container: {
		flex: 1,
		backgroundColor: 'white',
		fontFamily: 'Iowan Old Style',
		width: '100%',
		height: '100%',
		padding: 30,
	},

	scrollView: {
		backgroundColor: 'white',
	},

	header: {
		color: '#02d9b5',
		fontSize: 20,
	},

	text: {
		color: '#5c5c5c',
		fontSize: 15,
	},

	button: {
		backgroundColor: 'white',
		padding: 10,
		margin: 15,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: 'black',
		borderRadius: 7,
	},

	buttonText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 17,
		color: '#02d9b5',
	},

	doctor: {
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

	doctorinfo: {
		fontFamily: 'Iowan Old Style',
		color: '#5c5c5c',
		fontSize: 15,
	},

	spec: {
		marginTop: 15,
		fontFamily: 'Iowan Old Style',
		fontSize: 15,
		color: '#5c5c5c',
	},
});

export default Doctors;
