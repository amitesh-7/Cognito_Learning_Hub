// lib/providers/quiz_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/quiz.dart';
import '../services/quiz_service.dart';

// Quiz service provider
final quizServiceProvider = Provider((ref) => QuizService());

// Public quizzes provider
final publicQuizzesProvider = FutureProvider.autoDispose
    .family<List<Quiz>, QuizFilter>((ref, filter) async {
  final quizService = ref.watch(quizServiceProvider);
  return quizService.getPublicQuizzes(
    category: filter.category,
    difficulty: filter.difficulty,
    search: filter.search,
    page: filter.page,
    limit: filter.limit,
  );
});

// My quizzes provider
final myQuizzesProvider = FutureProvider.autoDispose<List<Quiz>>((ref) async {
  final quizService = ref.watch(quizServiceProvider);
  return quizService.getMyQuizzes();
});

// Single quiz provider
final quizByIdProvider = FutureProvider.autoDispose.family<Quiz?, String>((
  ref,
  id,
) async {
  final quizService = ref.watch(quizServiceProvider);
  return quizService.getQuizById(id);
});

// Categories provider
final categoriesProvider = FutureProvider<List<String>>((ref) async {
  final quizService = ref.watch(quizServiceProvider);
  return quizService.getCategories();
});

// Quiz filter model
class QuizFilter {
  final String? category;
  final String? difficulty;
  final String? search;
  final int page;
  final int limit;

  const QuizFilter({
    this.category,
    this.difficulty,
    this.search,
    this.page = 1,
    this.limit = 100,
  });

  QuizFilter copyWith({
    String? category,
    String? difficulty,
    String? search,
    int? page,
    int? limit,
    bool clearCategory = false,
    bool clearDifficulty = false,
    bool clearSearch = false,
  }) {
    return QuizFilter(
      category: clearCategory ? null : (category ?? this.category),
      difficulty: clearDifficulty ? null : (difficulty ?? this.difficulty),
      search: clearSearch ? null : (search ?? this.search),
      page: page ?? this.page,
      limit: limit ?? this.limit,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is QuizFilter &&
        other.category == category &&
        other.difficulty == difficulty &&
        other.search == search &&
        other.page == page &&
        other.limit == limit;
  }

  @override
  int get hashCode {
    return category.hashCode ^
        difficulty.hashCode ^
        search.hashCode ^
        page.hashCode ^
        limit.hashCode;
  }
}

// Quiz filter state provider
final quizFilterProvider = NotifierProvider<QuizFilterNotifier, QuizFilter>(() {
  return QuizFilterNotifier();
});

class QuizFilterNotifier extends Notifier<QuizFilter> {
  @override
  QuizFilter build() => const QuizFilter();

  void update(QuizFilter filter) => state = filter;
}

// Quiz taking state
class QuizTakingState {
  final Quiz? quiz;
  final int currentQuestionIndex;
  final Map<int, int?> answers; // questionIndex -> selectedOptionIndex
  final Map<int, int> timeTaken; // questionIndex -> seconds
  final bool isSubmitting;
  final bool isComplete;
  final String? error;
  final DateTime? startTime;

  const QuizTakingState({
    this.quiz,
    this.currentQuestionIndex = 0,
    this.answers = const {},
    this.timeTaken = const {},
    this.isSubmitting = false,
    this.isComplete = false,
    this.error,
    this.startTime,
  });

  QuizTakingState copyWith({
    Quiz? quiz,
    int? currentQuestionIndex,
    Map<int, int?>? answers,
    Map<int, int>? timeTaken,
    bool? isSubmitting,
    bool? isComplete,
    String? error,
    DateTime? startTime,
  }) {
    return QuizTakingState(
      quiz: quiz ?? this.quiz,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      answers: answers ?? this.answers,
      timeTaken: timeTaken ?? this.timeTaken,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isComplete: isComplete ?? this.isComplete,
      error: error ?? this.error,
      startTime: startTime ?? this.startTime,
    );
  }

  Question? get currentQuestion {
    if (quiz == null || currentQuestionIndex >= quiz!.questions.length) {
      return null;
    }
    return quiz!.questions[currentQuestionIndex];
  }

  bool get hasNextQuestion {
    return quiz != null && currentQuestionIndex < quiz!.questions.length - 1;
  }

  bool get hasPreviousQuestion {
    return currentQuestionIndex > 0;
  }

  double get progress {
    if (quiz == null || quiz!.questions.isEmpty) return 0;
    return (currentQuestionIndex + 1) / quiz!.questions.length;
  }

  int get answeredCount => answers.values.where((v) => v != null).length;
  int get totalQuestions => quiz?.questions.length ?? 0;

  int get score {
    if (quiz == null) return 0;
    int total = 0;
    answers.forEach((questionIndex, selectedOption) {
      if (selectedOption != null && questionIndex < quiz!.questions.length) {
        final question = quiz!.questions[questionIndex];
        final selectedAnswer = question.options[selectedOption];
        if (selectedAnswer == question.correctAnswer) {
          total += question.points;
        }
      }
    });
    return total;
  }

  int get correctAnswers {
    if (quiz == null) return 0;
    int count = 0;
    answers.forEach((questionIndex, selectedOption) {
      if (selectedOption != null && questionIndex < quiz!.questions.length) {
        final question = quiz!.questions[questionIndex];
        final selectedAnswer = question.options[selectedOption];
        if (selectedAnswer == question.correctAnswer) {
          count++;
        }
      }
    });
    return count;
  }
}

class QuizTakingNotifier extends Notifier<QuizTakingState> {
  @override
  QuizTakingState build() => const QuizTakingState();

  void startQuiz(Quiz quiz) {
    state = QuizTakingState(quiz: quiz, startTime: DateTime.now());
  }

  void answerQuestion(int selectedOptionIndex) {
    final newAnswers = Map<int, int?>.from(state.answers);
    newAnswers[state.currentQuestionIndex] = selectedOptionIndex;
    state = state.copyWith(answers: newAnswers);
  }

  void recordTime(int questionIndex, int seconds) {
    final newTimeTaken = Map<int, int>.from(state.timeTaken);
    newTimeTaken[questionIndex] = seconds;
    state = state.copyWith(timeTaken: newTimeTaken);
  }

  void nextQuestion() {
    if (state.hasNextQuestion) {
      state = state.copyWith(
        currentQuestionIndex: state.currentQuestionIndex + 1,
      );
    }
  }

  void previousQuestion() {
    if (state.hasPreviousQuestion) {
      state = state.copyWith(
        currentQuestionIndex: state.currentQuestionIndex - 1,
      );
    }
  }

  void goToQuestion(int index) {
    if (state.quiz != null &&
        index >= 0 &&
        index < state.quiz!.questions.length) {
      state = state.copyWith(currentQuestionIndex: index);
    }
  }

  void setSubmitting(bool value) {
    state = state.copyWith(isSubmitting: value);
  }

  void finishQuiz() {
    state = state.copyWith(isComplete: true, isSubmitting: false);
  }

  void setError(String error) {
    state = state.copyWith(error: error, isSubmitting: false);
  }

  void reset() {
    state = const QuizTakingState();
  }

  bool isLastQuestion() {
    return !state.hasNextQuestion;
  }
}

final quizTakingProvider =
    NotifierProvider<QuizTakingNotifier, QuizTakingState>(() {
  return QuizTakingNotifier();
});
