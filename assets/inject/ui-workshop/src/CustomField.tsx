import {Box, Stack, Text} from '@sanity/ui'
import React, {ReactNode} from 'react'

export function CustomField(props: {children?: ReactNode; title?: ReactNode}) {
  const {children, title} = props

  return (
    <Stack space={3}>
      <Text size={1} weight="semibold">
        {title}
      </Text>
      <Box>{children}</Box>
    </Stack>
  )
}
