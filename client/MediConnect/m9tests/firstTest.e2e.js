describe('Startup flow test', () => {
	beforeEach(async () => {
		await device.reloadReactNative();
	});

	it('should have startup screen', async () => {
		await device.reloadReactNative();
		await device.launchApp();
		await expect(element(by.id('startup'))).toBeVisible();
	});

	it('should show "Sign Up"', async () => {
		await device.reloadReactNative();
		await device.launchApp();
		await expect(element(by.id('signup'))).toBeVisible();
	});

	it('should show "Sign In"', async () => {
		await device.reloadReactNative();
		await device.launchApp();
		await expect(element(by.id('signin'))).toBeVisible();
	});

	it('should show Logo', async () => {
		await device.reloadReactNative();
		await device.launchApp();
		await expect(element(by.id('logo'))).toBeVisible();
	});
});
