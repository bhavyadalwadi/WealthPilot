export function SignInForm({ error, next }: { error?: string; next: string }) {
  return (
    <form action="/api/auth/signin" className="signin-form" method="post">
      <input name="next" type="hidden" value={next} />
      <label className="signin-field">
        <span>Username</span>
        <input autoComplete="username" name="username" required type="text" />
      </label>
      <label className="signin-field">
        <span>Password</span>
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      {error ? <p className="signin-error">{error}</p> : null}
      <button className="button button--primary signin-submit" type="submit">Sign In</button>
    </form>
  );
}
