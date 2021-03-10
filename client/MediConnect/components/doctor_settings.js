import React from 'react';
import {Component} from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

class DoctorSettings extends Component {
	async signout() {
		// console.log(global.userID);
		global.userID = '';
		// console.log(global.userID);

		this.props.navigation.navigate('StartUp');
	}

	render() {
		return (
			// <LinearGradient
			// 	start={{x: 0.0, y: 0.25}}
			// 	end={{x: 0.7, y: 1}}
			// 	colors={['#ffffff', '#ffffff', 'rgba(2, 217, 188, 0.2)']}
			// 	style={styles.LinearGradient}
			// >
			<View style={styles.container}>
				<View>
					<TouchableOpacity
						testID="Edit_Accounts_Buttons"
						style={styles.option}
						onPress={() => this.props.navigation.navigate('DoctorEditAccount')}
					>
						<View style={styles.icon}>
							<Icon name="user" size={30} color={'#5c5c5c'} />
						</View>
						<Text style={styles.optionText}>Account</Text>
					</TouchableOpacity>
				</View>
				{/* <View>
						<TouchableOpacity style={styles.option} onPress={() => this.props.navigation.navigate('DoctorNotifications')}>
							<View style={styles.icon}>
								<Icon name="bell" size={30} color={'#5c5c5c'} />
							</View>
							<Text style={styles.optionText}>Notifications</Text>
						</TouchableOpacity>
					</View> */}
				<View>
					<TouchableOpacity style={styles.option}>
						<View style={styles.icon}>
							<Icon name="credit-card" size={30} color={'#5c5c5c'} />
						</View>
						<Text style={styles.optionText}>Payments</Text>
					</TouchableOpacity>
				</View>
				<View>
					<TouchableOpacity style={styles.option}>
						<View style={styles.icon}>
							<Icon name="support" size={30} color={'#5c5c5c'} />
						</View>
						<Text style={styles.optionText}>Help and Support</Text>
					</TouchableOpacity>
				</View>
				<View>
					<TouchableOpacity style={styles.option}>
						<View style={styles.icon}>
							<Icon name="info" size={30} color={'#5c5c5c'} />
						</View>
						<Text style={styles.optionText}>About</Text>
					</TouchableOpacity>
				</View>
				<View>
					<TouchableOpacity
						style={styles.option}
						onPress={() => this.signout()}
					>
						<View style={styles.icon}>
							<Icon name="sign-out" size={30} color={'#5c5c5c'} />
						</View>
						<Text style={styles.optionText}>Sign Out</Text>
					</TouchableOpacity>
				</View>
			</View>
			// </LinearGradient>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		padding: 30,
		backgroundColor: 'white',
		width: '100%',
		height: '100%',
	},

	icon: {
		width: 50,
		justifyContent: 'center',
	},

	option: {
		padding: 10,
		borderColor: '#02f0c8',
		borderRadius: 7,
		backgroundColor: '#d9d9d9',
		// backgroundColor: '#d0d9d9',
		alignItems: 'center',
		margin: 10,
		flexDirection: 'row',
	},

	optionText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 20,
		color: '#5c5c5c',
	},
});

export default DoctorSettings;
