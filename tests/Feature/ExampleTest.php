<?php

test('the application redirects to the dashboard entry point', function () {
    $response = $this->get('/');

    $response->assertRedirect('/dashboard');
});
