import {Box, Card, Container, Text} from '@sanity/ui'
import {useString} from '@sanity/ui-workshop'
import {CustomField} from '../CustomField'
import React from 'react'

export default function PropsStory() {
  const title = useString('Title', 'My custom field')

  return (
    <Container width={1}>
      <Box paddingX={4} paddingY={[5, 6, 7]}>
        <CustomField title={title}>
          <Card border padding={3}>
            <Text>This is just an example</Text>
          </Card>
        </CustomField>
      </Box>
    </Container>
  )
}
