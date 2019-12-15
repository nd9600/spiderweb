@extends('layouts.app')

@section("appContent")
<div>
    @if(isset($appVars))
    <div class="hidden" data-app-vars="{!! json_encode($appVars) !!}"></div>
    @endif

    <nav class="py-2 mb-4 flex flex-row items-center justify-between border-b border-gray-300">
        <span>
            <a
                class="mr-5 pr-5 link border-r border-gray-300"
                href="{{ route('home') }}"
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
@endsection
