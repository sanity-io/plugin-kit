module.exports = {nullifyError}

function nullifyError(err) {
  if (err instanceof TypeError) {
    throw err
  }

  return null
}
