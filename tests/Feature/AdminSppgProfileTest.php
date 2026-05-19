<?php

use App\Models\PurchaseOrder;
use App\Models\Sppg;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->admin = User::query()->create([
        'name' => 'admin',
        'email' => 'admin@example.test',
        'password' => 'secret123',
    ]);

    $this->withSession([
        'auth_user' => [
            'role' => 'ADMIN',
            'id' => (string) $this->admin->id,
            'name' => $this->admin->name,
        ],
    ]);
});

test('admin can manage sppg records', function (): void {
    $this->get(route('master-sppg.index'))
        ->assertOk()
        ->assertSeeText('Master SPPG');

    $this->post(route('master-sppg.store'), [
        'code' => 'm2201',
        'name' => 'SPPG Gedeg',
        'location' => 'Mojokerto',
        'pic_name' => 'Ibu Sari',
        'whatsapp' => '08123456789',
    ])->assertRedirect(route('master-sppg.index'));

    $sppg = Sppg::query()->where('code', 'M2201')->firstOrFail();

    expect($sppg->name)->toBe('SPPG Gedeg')
        ->and($sppg->pic_name)->toBe('Ibu Sari');

    $this->patch(route('master-sppg.update', $sppg->id), [
        'code' => 'M2202',
        'name' => 'SPPG Jetis',
        'location' => 'Mojokerto Utara',
        'pic_name' => 'Pak Budi',
        'whatsapp' => '08990000111',
    ])->assertRedirect(route('master-sppg.index'));

    expect($sppg->refresh()->code)->toBe('M2202')
        ->and($sppg->name)->toBe('SPPG Jetis');

    $this->delete(route('master-sppg.destroy', $sppg->id))
        ->assertRedirect(route('master-sppg.index'));

    expect(Sppg::query()->whereKey($sppg->id)->exists())->toBeFalse();
});

test('admin cannot delete sppg used by purchase orders', function (): void {
    $sppg = Sppg::query()->create([
        'code' => 'M1101',
        'name' => 'SPPG Balongsari',
    ]);

    PurchaseOrder::query()->create([
        'number' => '1/PO/19052026/VP/2026',
        'date' => '2026-05-19',
        'created_by' => 'admin',
        'sppg_id' => $sppg->id,
        'status' => 'PROCESSING',
    ]);

    $this->delete(route('master-sppg.destroy', $sppg->id))
        ->assertRedirect(route('master-sppg.index'))
        ->assertSessionHasErrors('sppg');

    expect(Sppg::query()->whereKey($sppg->id)->exists())->toBeTrue();
});

test('admin can update profile username and password', function (): void {
    $this->patch(route('profile.update'), [
        'name' => 'superadmin',
        'password_current' => 'secret123',
        'password' => 'newpass123',
        'password_confirmation' => 'newpass123',
    ])->assertRedirect(route('profile.edit'));

    $this->admin->refresh();

    expect($this->admin->name)->toBe('superadmin')
        ->and(Hash::check('newpass123', $this->admin->password))->toBeTrue()
        ->and(session('auth_user.name'))->toBe('superadmin');
});

test('admin profile rejects wrong current password', function (): void {
    $this->patch(route('profile.update'), [
        'name' => 'superadmin',
        'password_current' => 'wrong-password',
        'password' => 'newpass123',
        'password_confirmation' => 'newpass123',
    ])->assertSessionHasErrors('password_current');

    expect(Hash::check('secret123', $this->admin->refresh()->password))->toBeTrue();
});
