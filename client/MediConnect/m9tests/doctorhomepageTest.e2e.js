describe('Doctor Homepage flow test', () => {
	beforeEach(async () => {
		//await device.reloadReactNative();
	});

	it('should have startup screen', async () => {
		await expect(element(by.id('startup'))).toBeVisible();
		//.withTimeout(200000);
	});

	it('should show "Sign Up"', async () => {
		await expect(element(by.id('signup'))).toBeVisible();
		//.withTimeout(200000);
	});

	it('should show "Sign In"', async () => {
		await expect(element(by.id('signin'))).toBeVisible();
		//.withTimeout(200000);
	});

	it('should render "Doctor Sign In Page" on pressing sign in', async () => {
		await element(by.id('signin')).tap();
		await expect(element(by.id('email'))).toBeVisible();
		//.withTimeout(200000);
		await expect(element(by.id('password'))).toBeVisible();
		await expect(element(by.id('signin_button'))).toBeVisible();
	});

	it('should go to “the homepage” on giving right info', async () => {
		await element(by.id('email')).clearText();
		await element(by.id('password')).clearText();
		await element(by.id('email')).typeText('alexjones@gmail.com');
		await element(by.id('password')).typeText('12345678');
		await element(by.id('signin_button')).tap();
		await expect(element(by.id('homepage'))).toBeVisible();
	});

	it('should go to “the appointments page”', async () => {
		await element(by.id('Appointments_Tab')).tap();
		await expect(element(by.id('Appointments_Page_Calendar'))).toBeVisible();
		await element(by.id('Home_Tab')).tap();
	});

	it('should go to “the notifications page”', async () => {
		await element(by.id('Notifications_Tab')).tap();
		await expect(element(by.id('Notifications_Page'))).toBeVisible();
		await element(by.id('Home_Tab')).tap();
	});

	it('should go to “the settings page”', async () => {
		await element(by.id('Settings_Tab')).tap();
		await expect(element(by.id('Edit_Accounts_Buttons'))).toBeVisible();
		await element(by.id('Home_Tab')).tap();
	});
});
