@extends('layouts.app')

@section('content')
    <form method="POST"
        action="{{ route('login') }}">
        @csrf

        <div class="mt-5">
            <label for="email">{{ __('Email Address') }}</label>

            <div>
                <input
                    id="email"
                    type="email"
                    class="py-2 px-3 input input--primary"
                    name="email"
                    value="{{ old('email') }}"
                    required
                    autocomplete="email"
                    autofocus>

                @error('email')
                <span
                    class="invalid-feedback"
                    role="alert"
                >
                    <strong>{{ $message }}</strong>
                </span>
                @enderror
            </div>
        </div>

        <div class="mt-5">
            <label for="password">{{ __('Password') }}</label>

            <div>
                <input id="password"
                    type="password"
                    class="py-2 px-3 input input--primary"
                    name="password"
                    required
                    autocomplete="current-password">

                @error('password')
                <span
                    class="invalid-feedback"
                    role="alert"
                >
                    <strong>{{ $message }}</strong>
                </span>
                @enderror
            </div>
        </div>

        <div class="mt-5">
            <div class="form-check">
                <input
                    type="checkbox"
                    name="remember"
                    id="remember" {{ old('remember') ? 'checked' : '' }}>

                <label for="remember">{{ __('Remember Me') }}</label>
            </div>
        </div>

        <div class="mt-10">
            <button type="submit"
                class="btn btn--primary">
                {{ __('Login') }}
            </button>

            <a class="ml-8 btn btn--secondary"
                href="{{ route('password.request') }}">
                {{ __('Forgot Your Password?') }}
            </a>
        </div>
    </form>
@endsection
