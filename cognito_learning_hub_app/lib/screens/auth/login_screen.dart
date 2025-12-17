// lib/screens/auth/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_input.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String _selectedRole = 'Student'; // Default role
  late AnimationController _floatingController;
  late AnimationController _rotationController;

  @override
  void initState() {
    super.initState();
    _floatingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _floatingController.dispose();
    _rotationController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final success = await ref
        .read(authProvider.notifier)
        .login(_emailController.text.trim(), _passwordController.text);

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      context.go(AppRoutes.home);
    } else {
      final error = ref.read(authProvider).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error ?? 'Login failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _handleGoogleSignIn() async {
    print('🔐 LOGIN SCREEN: Starting Google Sign In');
    setState(() => _isLoading = true);

    try {
      print('🔐 LOGIN SCREEN: Calling auth provider signInWithGoogle()');
      final success = await ref.read(authProvider.notifier).signInWithGoogle();
      print('🔐 LOGIN SCREEN: signInWithGoogle returned: $success');

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (success) {
        print('🔐 LOGIN SCREEN: Login successful, navigating to home');
        // Add small delay to ensure token is saved
        await Future.delayed(const Duration(milliseconds: 500));
        if (!mounted) return;
        context.go(AppRoutes.home);
      } else {
        final error = ref.read(authProvider).error;
        print('🔐 LOGIN SCREEN: Login failed with error: $error');
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? 'Google sign in failed. Please try again.'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } catch (e) {
      print('🔐 LOGIN SCREEN: Exception during Google Sign In: $e');
      print('🔐 LOGIN SCREEN: Stack trace: ${StackTrace.current}');
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 5),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Animated background with floating elements
          ...List.generate(5, (index) {
            return AnimatedBuilder(
              animation: _floatingController,
              builder: (context, child) {
                return Positioned(
                  top: 50 + (index * 150) + (_floatingController.value * 30),
                  left: 20 + (index * 60.0),
                  child: Opacity(
                    opacity: 0.1,
                    child: RotationTransition(
                      turns: _rotationController,
                      child: Icon(
                        [
                          Icons.emoji_events,
                          Icons.star,
                          Icons.local_fire_department,
                          Icons.bolt,
                          Icons.celebration
                        ][index],
                        size: 40 + (index * 10.0),
                        color: [
                          Colors.amber,
                          Colors.purple,
                          Colors.orange,
                          Colors.blue,
                          Colors.pink
                        ][index],
                      ),
                    ),
                  ),
                );
              },
            );
          }),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 20),

                    // Gamified Header with Trophy
                    Center(
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Pulsing glow effect
                          Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: RadialGradient(
                                colors: [
                                  AppTheme.primaryColor.withOpacity(0.3),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                          )
                              .animate(
                                onPlay: (controller) => controller.repeat(),
                              )
                              .scale(
                                duration: 2000.ms,
                                begin: const Offset(0.8, 0.8),
                                end: const Offset(1.2, 1.2),
                              ),
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              gradient: AppTheme.primaryGradient,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryColor.withOpacity(0.4),
                                  blurRadius: 20,
                                  spreadRadius: 5,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.school_rounded,
                              size: 40,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn().scale(),

                    const SizedBox(height: 24),

                    // Animated welcome text with sparkles
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Text(
                          'Welcome Back',
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(
                            fontWeight: FontWeight.bold,
                            shadows: [
                              Shadow(
                                color: AppTheme.primaryColor.withOpacity(0.3),
                                offset: const Offset(0, 2),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    )
                        .animate()
                        .fadeIn(delay: 200.ms)
                        .slideY(begin: 0.2)
                        .shimmer(delay: 500.ms, duration: 1500.ms),

                    const SizedBox(height: 8),

                    Text(
                      '🎯 Sign in to continue your learning adventure',
                      style: Theme.of(
                        context,
                      ).textTheme.bodyLarge?.copyWith(color: Colors.grey),
                      textAlign: TextAlign.center,
                    ).animate().fadeIn(delay: 300.ms),

                    const SizedBox(height: 32),

                    // Role Selection with Gamified Cards
                    Text(
                      'Select Your Role',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                      textAlign: TextAlign.center,
                    ).animate().fadeIn(delay: 350.ms),

                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                          child: _buildRoleCard(
                            role: 'Student',
                            icon: Icons.school,
                            color: Colors.blue,
                            emoji: '🎓',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildRoleCard(
                            role: 'Teacher',
                            icon: Icons.person_outline,
                            color: Colors.purple,
                            emoji: '👨‍🏫',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildRoleCard(
                            role: 'Admin',
                            icon: Icons.admin_panel_settings,
                            color: Colors.orange,
                            emoji: '👑',
                          ),
                        ),
                      ],
                    ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1),

                    const SizedBox(height: 32),

                    // Email Input
                    AppInput(
                      controller: _emailController,
                      label: 'Email',
                      hint: 'Enter your email',
                      keyboardType: TextInputType.emailAddress,
                      prefixIcon: Icons.email_outlined,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your email';
                        }
                        if (!RegExp(
                          r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                        ).hasMatch(value)) {
                          return 'Please enter a valid email';
                        }
                        return null;
                      },
                    ).animate().fadeIn(delay: 400.ms).slideX(begin: -0.1),

                    const SizedBox(height: 16),

                    // Password Input
                    AppInput(
                      controller: _passwordController,
                      label: 'Password',
                      hint: 'Enter your password',
                      obscureText: true,
                      prefixIcon: Icons.lock_outlined,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        if (value.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                    ).animate().fadeIn(delay: 500.ms).slideX(begin: -0.1),

                    const SizedBox(height: 8),

                    // Forgot Password
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {
                          // TODO: Navigate to forgot password
                        },
                        child: const Text('Forgot Password?'),
                      ),
                    ).animate().fadeIn(delay: 600.ms),

                    const SizedBox(height: 24),

                    // Login Button
                    AppButton(
                      text: 'Sign In',
                      onPressed: _handleLogin,
                      isLoading: _isLoading,
                    ).animate().fadeIn(delay: 700.ms).slideY(begin: 0.2),

                    const SizedBox(height: 24),

                    // Divider
                    Row(
                      children: [
                        const Expanded(child: Divider()),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'OR',
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                        ),
                        const Expanded(child: Divider()),
                      ],
                    ).animate().fadeIn(delay: 800.ms),

                    const SizedBox(height: 24),

                    // Google Sign In
                    OutlinedButton.icon(
                      onPressed: _isLoading ? null : _handleGoogleSignIn,
                      icon: Image.network(
                        'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
                        width: 24,
                        height: 24,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          );
                        },
                        errorBuilder: (context, error, stackTrace) {
                          return const Icon(Icons.login, size: 24);
                        },
                      ),
                      label: const Text('Continue with Google'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ).animate().fadeIn(delay: 900.ms),

                    const SizedBox(height: 32),

                    // Sign Up Link with gamified style
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.purple.withOpacity(0.1),
                            Colors.blue.withOpacity(0.1),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.grey.withOpacity(0.2),
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text(
                            "Don't have an account?",
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 4),
                          TextButton(
                            onPressed: () => context.push(AppRoutes.signup),
                            child: const Text(
                              'Sign Up & Start 🚀',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 1000.ms).shimmer(delay: 1200.ms),

                    // Motivational text for students
                    if (_selectedRole == 'Student') ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.amber.withOpacity(0.2),
                              Colors.orange.withOpacity(0.2),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.emoji_events, color: Colors.amber),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Earn points, unlock badges, and climb the leaderboard! 🎮',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      fontWeight: FontWeight.w500,
                                    ),
                              ),
                            ),
                          ],
                        ),
                      )
                          .animate()
                          .fadeIn(delay: 1100.ms)
                          .slideY(begin: 0.1)
                          .shimmer(delay: 1300.ms),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard({
    required String role,
    required IconData icon,
    required Color color,
    required String emoji,
  }) {
    final isSelected = _selectedRole == role;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedRole = role;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(
                  colors: [
                    color.withOpacity(0.3),
                    color.withOpacity(0.1),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isSelected ? null : Colors.grey.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? color : Colors.grey.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.4),
                    blurRadius: 12,
                    spreadRadius: 2,
                  ),
                ]
              : [],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Emoji with bounce animation when selected
            AnimatedScale(
              scale: isSelected ? 1.2 : 1.0,
              duration: const Duration(milliseconds: 300),
              child: Text(
                emoji,
                style: const TextStyle(fontSize: 28),
              ),
            ),
            const SizedBox(height: 8),
            Icon(
              icon,
              color: isSelected ? color : Colors.grey,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              role,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? color : Colors.grey,
              ),
            ),
            if (isSelected) ...[
              const SizedBox(height: 4),
              Icon(
                Icons.check_circle,
                color: color,
                size: 16,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
