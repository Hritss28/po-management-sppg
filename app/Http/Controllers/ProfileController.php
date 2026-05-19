<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ProcurementHelpers;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class ProfileController extends Controller
{
    use ProcurementHelpers;

    public function edit(): View|RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        return view('profile.edit', [
            'currentUser' => $this->currentUser(),
            'user' => $this->adminUser(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        if ($redirect = $this->requireAuth()) {
            return $redirect;
        }

        $this->authorizeAdmin();

        $user = $this->adminUser();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('users', 'name')->ignore($user)],
            'password_current' => ['nullable', 'required_with:password', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ]);

        if (filled($validated['password'] ?? null) && ! Hash::check($validated['password_current'], $user->password)) {
            return back()
                ->withErrors(['password_current' => 'Password saat ini tidak sesuai.'])
                ->withInput();
        }

        $user->name = $validated['name'];

        if (filled($validated['password'] ?? null)) {
            $user->password = $validated['password'];
        }

        $user->save();

        $request->session()->put('auth_user', array_merge($this->currentUser(), [
            'id' => (string) $user->id,
            'name' => $user->name,
        ]));

        return redirect()->route('profile.edit')->with('success', 'Profile berhasil diperbarui.');
    }

    private function adminUser(): User
    {
        return User::query()->findOrFail($this->currentUser()['id']);
    }
}
