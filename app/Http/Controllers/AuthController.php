<?php

namespace App\Http\Controllers;

use App\Models\Sppg;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function showLogin(Request $request): View|RedirectResponse
    {
        if ($request->session()->has('auth_user')) {
            return redirect()->route('dashboard');
        }

        return view('auth.login');
    }

    public function login(Request $request): RedirectResponse
    {
        $mode = $request->string('mode')->toString();

        if ($mode === 'admin') {
            $credentials = $request->validate([
                'username' => ['required', 'string'],
                'password' => ['required', 'string'],
            ]);

            $admin = User::query()->where('name', $credentials['username'])->first();

            if ($admin === null || ! Hash::check($credentials['password'], $admin->password)) {
                return back()
                    ->withErrors(['username' => 'Username atau password admin tidak sesuai.'])
                    ->withInput(['mode' => 'admin', 'username' => $credentials['username']]);
            }

            $request->session()->regenerate();
            $request->session()->put('auth_user', [
                'role' => 'ADMIN',
                'id' => (string) $admin->id,
                'name' => $admin->name,
            ]);

            return redirect()->route('dashboard');
        }

        $validated = $request->validate([
            'sppg_code' => ['required', 'string'],
        ]);

        $code = strtoupper(trim($validated['sppg_code']));
        $unit = Sppg::query()->where('code', $code)->first();

        if ($unit === null) {
            return back()
                ->withErrors(['sppg_code' => 'Kode SPPG belum terdaftar. Gunakan M1101 untuk SPPG-Balongsari.'])
                ->withInput(['mode' => 'sppg', 'sppg_code' => $code]);
        }

        $request->session()->regenerate();
        $request->session()->put('auth_user', [
            'role' => 'SPPG',
            'id' => $unit->code,
            'name' => $unit->name,
            'location' => $unit->location,
        ]);

        return redirect()->route('dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget('auth_user');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
