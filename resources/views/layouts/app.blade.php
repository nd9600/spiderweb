<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >

    <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
    >
    <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
    >
    <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
    >
    <link
        rel="manifest"
        href="/site.webmanifest"
    >

    <!-- CSRF Token -->
    <meta
        name="csrf-token"
        content="{{ csrf_token() }}"
    >

    <title>
        @yield('title', "Spiderweb")
    </title>

    <!-- Scripts -->

    <!-- Styles -->
    <link
        href="{{ asset('css/app.css') }}"
        rel="stylesheet"
    >
    <link
        href="{{ asset('css/tailwind.min.css') }}"
        rel="stylesheet"
    >
</head>
<body>
<div>
    <nav class="py-2 mb-4 flex flex-row items-center justify-between border-b border-gray-300">
        <span>
            <a
                class="mr-5 pr-5 link border-r border-gray-300"
                href="{{ url('/home') }}"
            >
                @yield('navbarTitle', "Spiderweb")
            </a>

            @guest
                <a
                    class="link mr-3"
                    href="{{ route('login') }}"
                >
                    {{ __('Login') }}
                </a>
                <a
                    class="link"
                    href="{{ route('register') }}"
                >
                    {{ __('Register') }}
                </a>
            @endguest
        </span>

        <span>
            @auth
                <form
                    id="logout-form"
                    action="{{ route('logout') }}"
                    method="POST"
                >
                    @csrf
                    <button
                        class="btn btn--secondary"
                        type="submit"
                    >
                        {{ __('Logout') }}
                    </button>
                </form>
            @endauth
        </span>
    </nav>

    <main>
        @yield('content')
    </main>
</div>
</body>
</html>
