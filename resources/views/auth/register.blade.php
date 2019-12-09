@extends('layouts.app')

@section('title')
    Spiderweb - register
@endsection

@section('navbarTitle')
    Spiderweb - register
@endsection

@section('content')
<div class="flex flex-col">
    <h1 class="h h--1">{{ __('Register') }}</h1>

    <div class="">
        <form
            method="POST"
            action="{{ route('register') }}"
        >
            @csrf

            <div class="mt-8">
                <label for="name">{{ __('Name') }}</label>

                <div>
                    <input id="name"
                        type="text"
                        class="py-2 px-3 input input--primary"
                        name="name"
                        value="{{ old('name') }}"
                        required
                        autocomplete="name"
                        autofocus>

                    @error('name')
                    <span
                        class=""
                        role="alert"
                    >
                        <strong>{{ $message }}</strong>
                    </span>
                    @enderror
                </div>
            </div>

            <div class="mt-8">
                <label for="username">{{ __('Username') }}</label>

                <div>
                    <input id="username"
                        type="text"
                        class="py-2 px-3 input input--primary"
                        name="username"
                        value="{{ old('username') }}"
                        required
                        autocomplete="username"
                        autofocus>

                    @error('username')
                    <span class="invalid-feedback"
                        role="alert">
                        <strong>{{ $message }}</strong>
                    </span>
                    @enderror
                </div>
            </div>

            <div class="mt-8">
                <label for="email"
                    class="col-md-4 col-form-label text-md-right">{{ __('Email address') }}</label>

                <div>
                    <input id="email"
                        type="email"
                        class="py-2 px-3 input input--primary"
                        name="email"
                        value="{{ old('email') }}"
                        required
                        autocomplete="email">

                    @error('email')
                    <span class="invalid-feedback"
                        role="alert">
                        <strong>{{ $message }}</strong>
                    </span>
                    @enderror
                </div>
            </div>

            <div class="mt-8">
                <label for="password"
                    class="col-md-4 col-form-label text-md-right">{{ __('Password') }}</label>

                <div>
                    <input id="password"
                        type="password"
                        class="py-2 px-3 input input--primary"
                        name="password"
                        required
                        autocomplete="new-password">

                    @error('password')
                    <span class="invalid-feedback"
                        role="alert">
                        <strong>{{ $message }}</strong>
                    </span>
                    @enderror
                </div>
            </div>

            <div class="mt-8">
                <label for="password-confirm"
                    class="col-md-4 col-form-label text-md-right">{{ __('Confirm Password') }}</label>

                <div>
                    <input id="password-confirm"
                        type="password"
                        class="py-2 px-3 input input--primary"
                        name="password_confirmation"
                        required
                        autocomplete="new-password">
                </div>
            </div>

            <button
                type="submit"
                class="mt-16 py-2 px-4 btn btn--primary"
            >
                {{ __('Register') }}
            </button>
        </form>
    </div>
</div>
@endsection
