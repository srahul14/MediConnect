import React from 'react';
import {Component} from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Calendar} from 'react-native-calendars';

class CreateAppointment extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.onDayPress = this.onDayPress.bind(this);
	}

	onDayPress(day) {
		this.setState({
			selected: day.dateString,
		});
		this.props.navigation.navigate('SlotBooking', {
			bookingDate: day,
			selectedID: this.props.route.params.selectedID,
		});
	}

	// _onPressBack(){
	//     const {goBack} = this.props.navigation
	//       goBack()
	// }
	render() {
		return (
			<LinearGradient
				start={{x: 0.0, y: 0.25}}
				end={{x: 0.7, y: 1}}
				colors={['#ffffff', '#ffffff', 'rgba(2, 217, 188, 0.2)']}
				style={styles.LinearGradient}
			>
				<View style={styles.container}>
					<StatusBar barStyle="light-content" />

					<Calendar
						onDayPress={this.onDayPress}
						style={styles.calendar}
						hideExtraDays
						markedDates={{[this.state.selected]: {selected: true}}}
						theme={{
							selectedDayBackgroundColor: 'green',
							todayTextColor: 'green',
							arrowColor: 'green',
						}}
					/>
				</View>
			</LinearGradient>
		);
	}
}

const styles = StyleSheet.create({
	LinearGradient: {
		width: '100%',
		height: '100%',
	},

	container: {
		padding: 30,
		flex: 1,
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
		textDecorationLine: 'underline',
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

	calendar: {
		borderTopWidth: 1,
		paddingTop: 5,
		borderBottomWidth: 1,
		borderColor: '#eee',
		height: 350,
	},
});

export default CreateAppointment;
